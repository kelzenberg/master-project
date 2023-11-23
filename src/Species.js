import * as THREE from "../node_modules/three/build/three.module.js";

class Species {
    constructor(site, molecules) {
        this.site = site;
        this.molecules = molecules;
    }

    createMesh() {
        const speciesMesh = new THREE.Object3D();
        this.molecules.forEach(molecule => {
          const moleculeMesh = molecule.createMesh();
          speciesMesh.add(moleculeMesh);
        });
    
        speciesMesh.position.copy(this.site);
    
        return speciesMesh;
    }
}

export default Species;