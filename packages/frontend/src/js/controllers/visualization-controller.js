import {
  Scene,
  WebGLRenderer,
  Vector3,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  SphereGeometry,
  MeshStandardMaterial,
  Color,
  Mesh,
  Group,
  Box3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Molecule from '../models/Molecule';
import Species from '../models/Species';

export class VisualizationController {
  #fixedSpecies;
  #config;
  #sitesGroup;
  #speciesDictionary;
  #typeDefinitions;
  #allGeometriesGroup;
  #canvas;
  #scene;
  #renderer;
  #axesHelper;
  #camera;
  #controls;
  #ambientLight;
  #directionalLight;

  constructor(fixedSpecies, config, sitesGroup, speciesDictionary, typeDefinitions) {
    this.#fixedSpecies = fixedSpecies;
    this.#config = config;
    this.#sitesGroup = sitesGroup;
    this.#speciesDictionary = speciesDictionary;
    this.#typeDefinitions = typeDefinitions;
    this.#allGeometriesGroup = new Group();

    // Renderer and Scene setup
    this.#canvas = document.querySelector('#canvas');
    this.#scene = new Scene();
    this.#scene.add(this.#allGeometriesGroup);
    this.#renderer = new WebGLRenderer({ canvas: this.#canvas });
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(window.innerWidth * 0.4, window.innerHeight * 0.4);
    this.#renderer.setClearColor(0xff_ff_ff);

    // Camera setup
    this.#camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // OrbitControls setup
    this.#controls = new OrbitControls(this.#camera, this.#canvas);
    this.#controls.enableDamping = true;
    this.#controls.dampingFactor = 0.25;

    // Lighting setup
    this.#ambientLight = new AmbientLight(0xff_ff_ff, 1);
    this.#directionalLight = new DirectionalLight(0xff_ff_ff, 1);
    this.#directionalLight.position.set(0, 1, 1).normalize();

    this.#scene.add(this.#directionalLight);
    this.#scene.add(this.#ambientLight);

    // Enable Reset View function
    const resetButton = document.querySelector('#resetViewButton');
    resetButton.addEventListener('click', () => {
      this.#controls.reset();
    });
  }

  // Public Functions
  renderInitialData() {
    this.#initializeSpecies();
    this.#renderFixedSpecies();
    this.#renderSpeciesFromConfig();
    this.#setViewPortAlignment();
  }

  renderDynamicData(config) {
    this.#config = config;
    this.#renderSpeciesFromConfig();
  }

  animate() {
    //this.#resizeCanvasToDisplaySize();

    requestAnimationFrame(() => this.animate());
    this.#controls.update();
    this.#renderer.render(this.#scene, this.#camera);
  }

  // Private Functions
  #initializeSpecies() {
    for (let siteIndex = 0; siteIndex < this.#sitesGroup.children.length; siteIndex++) {
      const site = this.#sitesGroup.children[siteIndex];

      for (const [speciesIndex, molecules] of this.#speciesDictionary.entries()) {
        const species = new Species(site, molecules);
        const speciesMesh = species.createMesh();

        speciesMesh.userData.siteIndex = siteIndex;
        speciesMesh.userData.speciesIndex = speciesIndex;

        speciesMesh.userData.dynamic = false; // Initially set to inactive
        speciesMesh.visible = false; // Initially hide the mesh

        this.#allGeometriesGroup.add(speciesMesh);
      }
    }
  }

  #renderFixedSpecies() {
    for (const data of this.#fixedSpecies) {
      let molecule = this.#createMolecule(data);
      const sphereGeometry = new SphereGeometry(molecule.sphereRadius, 32, 32);
      const sphereMaterial = new MeshStandardMaterial({
        color: new Color(molecule.color.x, molecule.color.y, molecule.color.z),
      });
      const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);
      sphereMesh.position.copy(molecule.position);

      this.#allGeometriesGroup.add(sphereMesh);
    }
  }

  #renderSpeciesFromConfig() {
    this.#clearDynamicSpecies();

    for (const [siteIndex, speciesIndex] of this.#config.entries()) {
      const existingSpeciesMesh = this.#allGeometriesGroup.children.find(
        child =>
          child.userData.dynamic === false &&
          child.userData.siteIndex === siteIndex &&
          child.userData.speciesIndex === speciesIndex
      );
      if (existingSpeciesMesh) {
        existingSpeciesMesh.visible = true;
        existingSpeciesMesh.userData.dynamic = true;
      }
    }
  }

  #clearDynamicSpecies() {
    for (let i = 0; i < this.#allGeometriesGroup.children.length; i++) {
      const dynamicSpeciesMesh = this.#allGeometriesGroup.children.find(child => child.userData.dynamic === true);
      if (dynamicSpeciesMesh) {
        dynamicSpeciesMesh.userData.dynamic = false;
        dynamicSpeciesMesh.visible = false;
      }
    }
  }

  #createMolecule(data) {
    let position = new Vector3(data.x, data.y, data.z);
    let type = data.type;
    let radius = this.#typeDefinitions[type].radius;
    let color = this.#typeDefinitions[type].color;
    return new Molecule(position, radius, color);
  }

  #setViewPortAlignment() {
    const rotationAngleX = -Math.PI / 2; // -90 degrees in radians
    this.#allGeometriesGroup.rotation.set(rotationAngleX, 0, 0);

    let xOffset = this.#calculateXOffset(this.#fixedSpecies);
    let yOffset = this.#calculateYOffset();
    let zOffset = this.#calculateZOffset();
    let offset = new Vector3(xOffset, yOffset, zOffset);
    this.#setCameraToFitBoundingBox();
    this.#allGeometriesGroup.position.copy(offset);
  }

  // Viewport Alignment Helper Functions:
  #calculateXOffset(jsonData) {
    let maxX = Number.NEGATIVE_INFINITY;
    let minX = Number.POSITIVE_INFINITY;

    for (const data of jsonData) {
      let molecule = this.#createMolecule(data);
      let x = molecule.position.x;

      // Update maxX and minX based on current molecule's x value
      maxX = Math.max(maxX, x);
      minX = Math.min(minX, x);
    }

    // Calculate the centerPoint based on maxX and minX
    let centerPoint = new Vector3();
    centerPoint.x = (maxX + minX) / 2;
    centerPoint.y = 0;
    centerPoint.z = 0;

    return -maxX + centerPoint.x;
  }

  #calculateZOffset() {
    let boundingBox = new Box3().setFromObject(this.#allGeometriesGroup);
    let centerPoint = new Vector3();
    boundingBox.getCenter(centerPoint);

    return -centerPoint.z;
  }

  #calculateYOffset() {
    let boundingBox = new Box3().setFromObject(this.#allGeometriesGroup);
    let centerPoint = new Vector3();
    boundingBox.getCenter(centerPoint);

    return -centerPoint.y;
  }

  #setCameraToFitBoundingBox() {
    let distance = this.#determineCameraDistance();
    let newPosition = new Vector3(0, distance, distance);

    this.#camera.position.copy(newPosition);
    this.#camera.lookAt(new Vector3(0, 0, 0));
    this.#controls.saveState();
  }

  #determineCameraDistance() {
    let cameraDistance;
    let halfFOVInRadians = this.#getRadians(this.#camera.fov / 2);
    let { width } = this.#getObjectSize(this.#allGeometriesGroup);
    cameraDistance = width / 2 / Math.tan(halfFOVInRadians);
    return cameraDistance;
  }

  #getObjectSize(target) {
    let box = new Box3().setFromObject(target);
    let size = {
      depth: -1 * box.min.z + box.max.z,
      height: -1 * box.min.y + box.max.y,
      width: -1 * box.min.x + box.max.x,
    };
    return size;
  }

  #getRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  #resizeCanvasToDisplaySize() {
    const canvas = this.#renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // adjust displayBuffer size to match
    if (canvas.width !== width || canvas.height !== height) {
      // you must pass false here or three.js sadly fights the browser
      this.#renderer.setSize(width, height, false);
      this.#camera.aspect = width / height;
      this.#camera.updateProjectionMatrix();

      // update any render target sizes here

      //Hier nochmal schauen wegen Canvas shrink
    }
  }
}
