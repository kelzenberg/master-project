/* eslint-disable no-undef */
import { Vector3, Color } from 'three';
import Molecule from './Molecule';
import Species from './Species';

describe('Species', () => {
  let species;
  let molecules;

  beforeEach(() => {
    molecules = [
      new Molecule(new Vector3(1, 2, 3), 5, [0.1, 0.2, 0.3]),
      new Molecule(new Vector3(4, 5, 6), 7, [0.4, 0.5, 0.6]),
    ];
    species = new Species({ position: new Vector3(7, 8, 9) }, molecules);
  });

  it('should create a species with correct properties', () => {
    expect(species.site).toEqual({ position: new Vector3(7, 8, 9) });
    expect(species.molecules).toEqual(molecules);
  });

  it('should create a mesh with correct properties', () => {
    const speciesMesh = species.createMesh();
    expect(speciesMesh.position).toEqual(species.site.position);
    expect(speciesMesh.children.length).toBe(molecules.length);
    for (const [i, molecule] of molecules.entries()) {
      expect(speciesMesh.children[i].position).toEqual(molecule.position);
      expect(speciesMesh.children[i].material.color.getHex()).toEqual(
        new Color(molecule.color.x, molecule.color.y, molecule.color.z).getHex()
      );
      expect(speciesMesh.children[i].geometry.parameters.radius).toBe(molecule.sphereRadius);
    }
  });
});
