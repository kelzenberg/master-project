import { Vector3, SphereGeometry, MeshStandardMaterial, Color, Mesh } from 'three';

/**
 * Represents a molecule or types visual representation in the simulation.
 */
class Molecule {
  /**
   * Creates a Molecule instance.
   * @param {Vector3} position - The position of the molecule.
   * @param {number} sphereRadius - The radius of the sphere representing the molecule.
   * @param {number[]} rgb - An array representing the RGB color values of the molecule.
   * @public
   */
  constructor(position, sphereRadius, rgb) {
    this.position = position;
    this.sphereRadius = sphereRadius;
    this.color = new Vector3(rgb[0], rgb[1], rgb[2]);
  }

  /**
   * Creates a mesh representation of the molecule.
   * @returns {Mesh} The mesh representing the molecule.
   * @public
   */
  createMesh() {
    const geometry = new SphereGeometry(this.sphereRadius, 32, 32);
    const material = new MeshStandardMaterial({ color: new Color(this.color.x, this.color.y, this.color.z) });
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(this.position);
    return mesh;
  }
}

export default Molecule;
