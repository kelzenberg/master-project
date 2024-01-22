import { Vector3, SphereGeometry, MeshStandardMaterial, Color, Mesh } from 'three';

class Molecule {
  constructor(position, sphereRadius, rgb) {
    this.position = position;
    this.sphereRadius = sphereRadius;
    this.color = new Vector3(rgb[0], rgb[1], rgb[2]);
  }

  createMesh() {
    const geometry = new SphereGeometry(this.sphereRadius, 32, 32);
    const material = new MeshStandardMaterial({ color: new Color(this.color.x, this.color.y, this.color.z) });
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(this.position);
    return mesh;
  }
}

export default Molecule;
