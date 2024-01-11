#!/usr/bin/env python3

"""
Example script to collect the required json formatted data
of a simulation for the WebGL project.
"""

import json
import logging
import numpy as np
import ase
from ase import Atoms
from kmcos.run import KMC_Model, get_tof_names


logger = logging.getLogger(__name__)

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
        self.initial_data = json.dumps(get_initial_data(self))
        self.dynamic_data = None

    def do_steps(self, n=10000, progress=False):
        super().do_steps(n, progress)
        self.dynamic_data = json.dumps(get_dynamic_data(self))

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

def _get_adsorbate_species(model):
    try:
        species = sorted(model.settings.representations)
        logger.debug("Collected adsorbate species tags.")
    except:
        raise RuntimeError("Could not collect adsorbate species tags.")
    return species

def _get_surface_species(model):
    try:
        atoms = eval(model.settings.lattice_representation)[0]
        surface = sorted(list(set(atoms.get_chemical_symbols())))
        logger.debug("Collected surface species tags.")
    except:
        raise RuntimeError("Could not collect surface species tags.")
    return surface

def _get_type_definition(atom_type, info=None):
    try:
        rad = ase.data.covalent_radii[ase.data.atomic_numbers[atom_type]]
        col = ase.data.colors.jmol_colors[ase.data.atomic_numbers[atom_type]].tolist()
        full = ase.data.atomic_names[ase.data.atomic_numbers[atom_type]]
    except:
        rad = 0.0
        col = [0.0, 0.0, 0.0]
        full = 'empty'
    return {'radius': rad, 'color': col, 'name': full, 'info': info}

def _get_fixed_species(model):
    atoms = eval(model.settings.lattice_representation)[0]
    size = model.lattice.system_size
    atoms = atoms.repeat(size)
    fixed_species = _get_coords_and_tags(atoms)
    return fixed_species

def _get_sites(model):
    grid = np.meshgrid(*[np.arange(0, n) for n in model.lattice.system_size])
    grid = list(zip(*(_.flat for _ in grid)))
    sites = []
    for i in grid:
        for s in model.lattice.site_positions:
            site = list(
                np.dot(s, model.lattice.unit_cell_size) +
                np.dot(i, model.lattice.unit_cell_size))
            sites.append({"x": site[0], "y": site[1], "z": site[2]})
    return sites

def _get_coords(atoms):
    coords = []
    for coord in atoms.get_positions():
        coords.append({"x": coord[0], "y": coord[1], "z": coord[2]})
    return coords

def _get_coords_and_tags(atoms):
    coords = _get_coords(atoms)
    for n, symbol in enumerate(atoms.get_chemical_symbols()):
        coords[n]["type"] = symbol
    return coords

def _get_adjustable_params(model):
    adjustable_params = []
    for param in sorted(model.settings.parameters):
        if model.settings.parameters[param]['adjustable']:
            settings = model.settings.parameters[param]
            adjustable_params.append(
                {
                    "min": settings['min'],
                    "max": settings['max'],
                    "default": settings['value'],
                    "label": param,
                    "scale": settings['scale'],
                    # TODO somehow implement a way to put the info
                    "info": None
                }
            )
    return adjustable_params

def get_initial_data(model, to_file=False):
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
    state = model.get_atoms()
    species = _get_adsorbate_species(model)
    surface = _get_surface_species(model)
    atom_types = []
    for spec in species:
        try:
            atom_types.extend(list(ase.formula.Formula(spec).count().keys()))
            spec_atoms = eval(model.settings.representations[spec])
            initial_data_format_json["visualization"]["species"].append(
                _get_coords_and_tags(spec_atoms))
        except:
            atom_types.append(spec)
            initial_data_format_json["visualization"]["species"].append(
                [{"x": 0.0, "y": 0.0, "z": 0.0, "type": spec}])
        all_adorbate_labels = [_ for _ in model.get_occupation_header().split()
                               if _.startswith(spec+"_")]
        initial_data_format_json["plots"]["coverage"].extend(
            [{"averageLabel": spec,
              # TODO somehow implement a way to put the color
              "averageColor": None,
              "singleLabels": all_adorbate_labels,
              # TODO somehow implement a way to put the color
              "singleColors": [None] * len(all_adorbate_labels)}]
        )
    atom_types = sorted(list(set(atom_types+surface)))
    for t in atom_types:
        # TODO somehow implement a way to put the info
        initial_data_format_json["visualization"]["typeDefinitions"][t] = \
            _get_type_definition(t, info=None)
    initial_data_format_json["visualization"]["fixedSpecies"] = \
        _get_fixed_species(model)
    for name in get_tof_names():
        # TODO somehow implement a way to put the color
        initial_data_format_json["plots"]["tof"].append({"label": name, "color": None})
    initial_data_format_json["slider"] = _get_adjustable_params(model)
    initial_data_format_json["visualization"]["sites"] = _get_sites(model)
    initial_data_format_json = merge_dict(
        initial_data_format_json, get_dynamic_data(model, state=state, to_file=False)
    )
    if to_file:
        with open('initial-data-format.json', 'w') as initial_data_file:
            json.dump(initial_data_format_json, initial_data_file)
    return initial_data_format_json

def get_dynamic_data(model, state=None, to_file=False):
    dynamic_data_format_json = {
        "visualization": {
            "config": []
        },
        "plots": {
            "plotData": {
                "kmcTime": None,
                "tof": [],
                "coverage": []
            }
        }
    }
    if not state:
        state = model.get_atoms()
    for x_coord in range(model.lattice.system_size[0]):
        for y_coord in range(model.lattice.system_size[1]):
            for z_coord in range(model.lattice.system_size[2]):
                for sites_per_unit_cell in range(1, 1 + model.lattice.spuck):
                    dynamic_data_format_json["visualization"]["config"].append(
                        model.lattice.get_species(
                            [x_coord, y_coord, z_coord, sites_per_unit_cell]))
    dynamic_data_format_json["plots"]["plotData"]["kmcTime"] = \
        state.kmc_time
    for tof in zip(model.tof_data.tolist(), model.tof_integ.tolist()):
        dynamic_data_format_json["plots"]["plotData"]["tof"].append(
            {"values": list(tof)}
        )
    for occ in state.occupation.tolist():
        dynamic_data_format_json["plots"]["plotData"]["coverage"].append(
            {"values": occ}
        )
    if to_file:
        with open('dynamic-data-format.json', 'w') as dynamic_data_file:
            json.dump(dynamic_data_format_json, dynamic_data_file)
    return dynamic_data_format_json

if __name__ == "__main__":
    kmc_model = WebGLInterface()
    print(kmc_model.initial_data)
    spf = 1e6
    steps = 0
    while steps <= 1e7:
        kmc_model.do_steps(spf)
        print(kmc_model.dynamic_data)
        steps += spf
