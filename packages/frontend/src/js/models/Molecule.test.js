/* eslint-disable no-undef */
import { Vector3, Color } from 'three';
import Molecule from './Molecule';

describe('Molecule', () => {
  let molecule;

  beforeEach(() => {
    molecule = new Molecule(new Vector3(1, 2, 3), 5, [0.1, 0.2, 0.3]);
  });

  it('should create a molecule with correct properties', () => {
    expect(molecule.position).toEqual(new Vector3(1, 2, 3));
    expect(molecule.sphereRadius).toBe(5);
    expect(molecule.color).toEqual(new Vector3(0.1, 0.2, 0.3));
  });

  it('should create a mesh with correct properties', () => {
    const mesh = molecule.createMesh();
    expect(mesh.position).toEqual(molecule.position);
    expect(mesh.material.color.getHex()).toEqual(
      new Color(molecule.color.x, molecule.color.y, molecule.color.z).getHex()
    );
    expect(mesh.geometry.parameters.radius).toBe(molecule.sphereRadius);
  });
});
