import { Object3D } from 'three';

/**
 * Represents a species consisting of molecules at a specific site in the simulation.
 */
class Species {
  /**
   * Creates a Species instance.
   * @param {Object3D} site - The site where the species is located.
   * @param {Molecule[]} molecules - An array of molecules comprising the species.
   * @public
   */
  constructor(site, molecules) {
    this.site = site;
    this.molecules = molecules;
  }

  /**
   * Creates a mesh representation of the species.
   * @returns {Object3D} The mesh representing the species.
   */
  createMesh() {
    const speciesMesh = new Object3D();
    for (const molecule of this.molecules) {
      const moleculeMesh = molecule.createMesh();
      speciesMesh.add(moleculeMesh);
    }

    speciesMesh.position.copy(this.site.position);

    return speciesMesh;
  }
}

export default Species;
