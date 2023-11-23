import { Object3D } from 'three';

class Species {
  constructor(site, molecules) {
    this.site = site;
    this.molecules = molecules;
  }

  createMesh() {
    const speciesMesh = new Object3D();
    for (const molecule of this.molecules) {
      const moleculeMesh = molecule.createMesh();
      speciesMesh.add(moleculeMesh);
    }

    speciesMesh.position.copy(this.site);

    return speciesMesh;
  }
}

export default Species;
