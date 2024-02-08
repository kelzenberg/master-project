#!/usr/bin/env python3

"""
Example script to collect the required json formatted data
of a simulation for the WebGL project.
"""

import json
import logging
import os
import time
import sys
from datetime import datetime, timedelta
import numpy as np
import ase
import matplotlib
from flask import Flask, request, jsonify
from matplotlib import cm
from ase import Atoms
from kmcos.run import KMC_Model, get_tof_names, set_rate_constants
from kmc_model import base
import kmc_settings as settings


logger = logging.getLogger(__name__)

# https://stackoverflow.com/a/7205107
def merge_dict(a: dict, b: dict, path=[]):
    """
    Merge two dictionaries a and b.
    """
    for key in b:
        if key in a:
            if isinstance(a[key], dict) and isinstance(b[key], dict):
                merge_dict(a[key], b[key], path + [str(key)])
            elif a[key] != b[key]:
                raise Exception('Conflict at ' + '.'.join(path + [str(key)]))
        else:
            a[key] = b[key]
    return a

# https://stackoverflow.com/a/48359835
def rgba2rgb(color, background=[1.0, 1.0, 1.0]):
    alpha = color[3]
    return [np.floor((1 - alpha) * background[0]*255 + alpha * color[0]*255 + 0.5)/255,
            np.floor((1 - alpha) * background[1]*255 + alpha * color[1]*255 + 0.5)/255,
            np.floor((1 - alpha) * background[2]*255 + alpha * color[2]*255 + 0.5)/255]

class WebGLInterface(KMC_Model):
    """
    KMC_Model wrapper to collect the data as class attributes.
    """
    def __init__(self, image_queue=None, parameter_queue=None, signal_queue=None, size=None,
                 system_name='kmc_model', banner=True, print_rates=False, autosend=True,
                 steps_per_frame=50000, random_seed=None, cache_file=None, buffer_parameter=None,
                 threshold_parameter=None, sampling_steps=None, execution_steps=None,
                 save_limit=None):
        super().__init__(image_queue, parameter_queue, signal_queue, size, system_name, banner,
                         print_rates, autosend, steps_per_frame, random_seed, cache_file,
                         buffer_parameter, threshold_parameter, sampling_steps, execution_steps,
                         save_limit)
        self.parameter_queue = parameter_queue
        self._pid = None
        self._history = []
        self.dynamic_data = image_queue
        self.initial_data = self._get_initial_data()

    def run(self):
        """Runs the model indefinitely. To control the
        simulations, model must have been initialized
        with proper Queues."""
        self._pid = os.getpid()
        if not base.is_allocated():
            self.reset()
        while True:
            wait_until_time = datetime.utcnow() + timedelta(seconds=1./33)
            self.do_steps(self.steps_per_frame, progress=False)
            if self.dynamic_data.full():
                self.dynamic_data.get()
            self.dynamic_data.put(self._get_dynamic_data(slider=True))
            if not self.parameter_queue.empty():
                while not self.parameter_queue.empty():
                    parameters = self.parameter_queue.get()
                    settings.parameters.update(parameters)
                set_rate_constants(parameters, False, self.can_accelerate)
            seconds_to_sleep = (wait_until_time - datetime.utcnow()).total_seconds()
            if seconds_to_sleep < 0:
                seconds_to_sleep = 0
            time.sleep(seconds_to_sleep)

    def get_pid(self):
        return self._pid

    def _get_adsorbate_species(self):
        try:
            species = sorted(self.settings.representations)
            logger.debug("Collected adsorbate species tags.")
        except:
            raise RuntimeError("Could not collect adsorbate species tags.")
        return species

    def _get_surface_species(self):
        try:
            atoms = eval(self.settings.lattice_representation)[0]
            surface = sorted(list(set(atoms.get_chemical_symbols())))
            logger.debug("Collected surface species tags.")
        except:
            raise RuntimeError("Could not collect surface species tags.")
        return surface

    def _get_type_definition(self, atom_type, info=None):
        try:
            rad = ase.data.covalent_radii[ase.data.atomic_numbers[atom_type]]
            col = ase.data.colors.jmol_colors[ase.data.atomic_numbers[atom_type]].tolist()
            full = ase.data.atomic_names[ase.data.atomic_numbers[atom_type]]
        except:
            rad = 0.0
            col = [0.0, 0.0, 0.0]
            full = 'empty'
        return {'radius': rad, 'color': col, 'name': full, 'info': info}

    def _get_fixed_species(self):
        atoms = eval(self.settings.lattice_representation)[0]
        size = self.lattice.system_size
        atoms = atoms.repeat(size)
        fixed_species = self._get_coords_and_tags(atoms)
        return fixed_species

    def _get_sites(self):
        grid = np.meshgrid(*[np.arange(0, n) for n in self.lattice.system_size])
        grid = list(zip(*(_.flat for _ in grid)))
        sites = []
        for i in grid:
            for s in self.lattice.site_positions:
                site = list(
                    np.dot(s, self.lattice.unit_cell_size) +
                    np.dot(i, self.lattice.unit_cell_size))
                sites.append({"x": site[0], "y": site[1], "z": site[2]})
        return sites

    def _get_coords(self, atoms):
        coords = []
        for coord in atoms.get_positions():
            coords.append({"x": coord[0], "y": coord[1], "z": coord[2]})
        return coords

    def _get_coords_and_tags(self, atoms):
        coords = self._get_coords(atoms)
        for n, symbol in enumerate(atoms.get_chemical_symbols()):
            coords[n]["type"] = symbol
        return coords

    def _get_adjustable_params(self):
        adjustable_params = []
        for param in sorted(self.settings.parameters):
            if self.settings.parameters[param]['adjustable']:
                sett = self.settings.parameters[param]
                adjustable_params.append(
                    {
                        "min": sett['min'],
                        "max": sett['max'],
                        "default": sett['value'],
                        "label": param,
                        "scale": sett['scale'],
                        # TODO somehow implement a way to put the info
                        "info": None
                    }
                )
        return adjustable_params

    def _get_params(self):
        params = []
        for param in sorted(self.settings.parameters):
            if self.settings.parameters[param]['adjustable']:
                sett = self.settings.parameters[param]
                params.append(
                    {
                        "value": sett['value'],
                        "label": param,
                    }
                )
        return params

    def _get_initial_data(self):
        initial_data_format_json = {
            "visualization": {
                "typeDefinitions": {},
                "fixedSpecies": [],
                "species": [],
                "sites": [],
            },
            "slider": [],
            "plots": {
                "tof": [],
                "coverage": [],
            }
        }
        state = self.get_atoms()
        species = self._get_adsorbate_species()
        surface = self._get_surface_species()
        _cov_colors = [list(matplotlib.colors.to_rgb(c)) for c in cm.tab10.colors]
        _tof_colors = [list(matplotlib.colors.to_rgb(c)) for c in cm.Accent.colors]
        atom_types = []
        for n, spec in enumerate(species):
            try:
                atom_types.extend(list(ase.formula.Formula(spec).count().keys()))
                spec_atoms = eval(self.settings.representations[spec])
                initial_data_format_json["visualization"]["species"].append(
                    self._get_coords_and_tags(spec_atoms))
            except:
                atom_types.append(spec)
                initial_data_format_json["visualization"]["species"].append(
                    [{"x": 0.0, "y": 0.0, "z": 0.0, "type": spec}])
            all_adorbate_labels = [_ for _ in self.get_occupation_header().split()
                                   if _.startswith(spec+"_")]
            _alpha = np.linspace(0, 1, num=len(all_adorbate_labels), endpoint=False, retstep=True)
            _cov_subcolors = [rgba2rgb(_cov_colors[n%len(_cov_colors)]+[j])
                              for j in [i+_alpha[1] for i in _alpha[0]]]
            initial_data_format_json["plots"]["coverage"].extend(
                [{"averageLabel": spec,
                  "averageColor": _cov_colors[n%len(_cov_colors)],
                  "singleLabels": all_adorbate_labels,
                  "singleColors": _cov_subcolors}]
            )
        atom_types = sorted(list(set(atom_types+surface)))
        for t in atom_types:
            # TODO somehow implement a way to put the info
            initial_data_format_json["visualization"]["typeDefinitions"][t] = \
                self._get_type_definition(t, info=None)
        initial_data_format_json["visualization"]["fixedSpecies"] = \
            self._get_fixed_species()
        for n, name in enumerate(get_tof_names()):
            initial_data_format_json["plots"]["tof"].append(
                {"label": name, "color": _tof_colors[n%len(_tof_colors)]})
        initial_data_format_json["slider"] = self._get_adjustable_params()
        initial_data_format_json["visualization"]["sites"] = self._get_sites()
        initial_data_format_json = merge_dict(
            initial_data_format_json, self._get_dynamic_data(state=state)
        )
        return initial_data_format_json

    def _get_single_dynamic_data(self, state=None):
        if not state:
            state = self.get_atoms()
        kmc_time = state.kmc_time
        config = []
        tofs = []
        occs = []
        for x_coord in range(self.lattice.system_size[0]):
            for y_coord in range(self.lattice.system_size[1]):
                for z_coord in range(self.lattice.system_size[2]):
                    for sites_per_unit_cell in range(1, 1 + self.lattice.spuck):
                        config.append(
                            self.lattice.get_species(
                                [x_coord, y_coord, z_coord, sites_per_unit_cell]))
        for tof in zip(self.tof_data.tolist(), self.tof_integ.tolist()):
            _tof = []
            for t in tof:
                if np.isnan(t):
                    _tof.append(0.0)
                else:
                    _tof.append(float(t))
            tofs.append(
                {"values": _tof}
            )
        for occ in state.occupation.tolist():
            occs.append(
                {"values": occ}
            )
        return kmc_time, config, tofs, occs

    def _get_dynamic_data(self, history_lenght=30, state=None, slider=False):
        if not state:
            state = self.get_atoms()
        kmc_time, config, tofs, occs = self._get_single_dynamic_data(state=state)
        dynamic_data_format_json = {
            "visualization": {
                "config": config
            },
            "plots": {}
            }
        self._history.append({
            "kmcTime": kmc_time,
            "tof": tofs,
            "coverage": occs
        })
        if len(self._history) == history_lenght+1:
            self._history.pop(0)
        dynamic_data_format_json["plots"]["plotData"] = \
            self._history
        if slider:
            dynamic_data_format_json["sliderData"] = self._get_params()
        return dynamic_data_format_json

class FlaskWrapper(Flask):
    def __init__(self, import_name, image_queue, parameter_queue, signal_queue, steps_per_frame,
                 static_url_path=None, static_folder="static", static_host=None,
                 host_matching=False, subdomain_matching=False, template_folder="templates",
                 instance_path=None, instance_relative_config=False, root_path=None):
        super().__init__(import_name, static_url_path, static_folder, static_host, host_matching,
                         subdomain_matching, template_folder, instance_path,
                         instance_relative_config, root_path)
        self.kmc_model = WebGLInterface(image_queue=image_queue,
                                        parameter_queue=parameter_queue,
                                        signal_queue=signal_queue,
                                        steps_per_frame=steps_per_frame, banner=False)
        self.kmc_model.daemon = True
        self._simulation_running = False

    def start_simulation(self):
        self.kmc_model.start()
        self._simulation_running = True

    @property
    def simulation_running(self):
        return self._simulation_running

    @simulation_running.setter
    def simulation_running(self, value: bool):
        self._simulation_running = value

if __name__ == "__main__":
    import multiprocessing
    pq = multiprocessing.Queue(maxsize=10)
    sq = multiprocessing.Queue(maxsize=1)
    iq = multiprocessing.Queue(maxsize=100)
    spf = int(1e5)
    app = FlaskWrapper(import_name=__name__,
                       image_queue=iq,
                       parameter_queue=pq,
                       signal_queue=sq,
                       steps_per_frame=spf)

    @app.route('/health', methods=['GET'])
    def get_server_health():
        return (
            jsonify(
                success=True,
                hasStarted=app.kmc_model.pid and app.simulation_running,
                isPaused=app.kmc_model.pid and not app.simulation_running,
            ),
            200,
        )

    @app.route('/start', methods=['POST'])
    def start_simulation():
        if not app.simulation_running and not app.kmc_model.pid:
            app.start_simulation()
            app._simulation_running = True
            return jsonify(success=True), 201
        if app.simulation_running:
            return jsonify(success=False), 200
        return jsonify(success=False), 400

    @app.route('/pause', methods=['PUT'])
    def pause_simulation():
        if app.simulation_running:
            os.kill(app.kmc_model.pid, 19)
            app._simulation_running = False
            return jsonify(success=True), 200
        if not app.simulation_running:
            return jsonify(success=False), 200
        return jsonify(success=False), 400

    @app.route('/resume', methods=['PUT'])
    def resume_simulation():
        if not app.simulation_running:
            os.kill(app.kmc_model.pid, 18)
            app._simulation_running = True
            return jsonify(success=True), 200
        if app.simulation_running:
            return jsonify(success=False), 200
        return jsonify(success=False), 400

    @app.route('/reset', methods=['POST'])
    def reset_simulation():
        try:
            app.kmc_model._history = []
            while not app.kmc_model.dynamic_data.empty():
                app.kmc_model.dynamic_data.get()
            app.kmc_model.deallocate()
            app.kmc_model.reset()
            return jsonify(success=True), 201
        except:
            return jsonify(success=False), 400

    @app.route('/initial', methods=['GET'])
    def get_initial_data():
        return json.dumps(app.kmc_model.initial_data)

    @app.route('/dynamic', methods=['GET'])
    def get_dynamic_data():
        if app.simulation_running:
            return json.dumps(app.kmc_model.dynamic_data.get())
        return jsonify(success=False), 400

    @app.route('/slider', methods=['POST'])
    def update_parameter():
        data = request.get_json()
        if not data:
          return jsonify(success=False, reason="JSON data cannot be read"), 400
        try:
            label = data["label"]
        except:
            return jsonify(success=False, reason="No label"), 400
        try:
            value = data["value"]
        except:
            return jsonify(success=False, reason="No value"), 400
        if not label or not value:
            return jsonify(success=False, reason="No label or value"), 400
        try:
            value = float(value)
        except:
            return jsonify(success=False, reason="Value cannot be converted to Float"), 400
        if label not in settings.parameters.keys():
            return jsonify(success=False, reason="Label is not a parameter (key)"), 400
        if not settings.parameters[label]["adjustable"]:
            return jsonify(success=False, reason="Parameter of label is not adjustable"), 400
        vmin = float(settings.parameters[label]["min"])
        vmax = float(settings.parameters[label]["max"])
        if value < vmin or value > vmax:
            return jsonify(success=False, reason="Value is below min or above max"), 400
        settings.parameters[label]['value'] = str(value)
        app.kmc_model.parameter_queue.put(settings.parameters)
        return jsonify(success=True), 201

    try:
        port = int(os.environ.get('SIMULATION_PORT', 3001))
        app.run(host='0.0.0.0', port=port)
    except Exception as exc:
        print(exc)
