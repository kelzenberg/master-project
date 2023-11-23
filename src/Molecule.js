import { Vector3 } from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import * as THREE from "../node_modules/three/build/three.module.js";

class Molecule {
    constructor(position, sphereRadius, rgb) {
        this.position = position;
        this.sphereRadius = sphereRadius;
        this.rgb = new Vector3(rgb[0], rgb[1], rgb[2]);
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.sphereRadius, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(this.rgb.x, this.rgb.y, this.rgb.z) });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        return mesh;
    }
}

export default Molecule;