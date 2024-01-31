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
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper';
import Molecule from '../models/Molecule';
import Species from '../models/Species';

export class VisualizationController {
  #fixedSpecies;
  #config;
  #sitesGroup;
  #speciesDictionary;
  #typeDefinitions;
  #dynamicSpeciesGroup;
  #allGeometriesGroup;
  #canvas;
  #scene;
  #renderer;
  #camera;
  #viewHelper;
  #controls;

  constructor(fixedSpecies, config, sitesGroup, speciesDictionary, typeDefinitions) {
    this.#fixedSpecies = fixedSpecies;
    this.#config = config;
    this.#sitesGroup = sitesGroup;
    this.#speciesDictionary = speciesDictionary;
    this.#typeDefinitions = typeDefinitions;
    this.#dynamicSpeciesGroup = new Group();
    this.#allGeometriesGroup = new Group();

    this.#allGeometriesGroup.add(this.#dynamicSpeciesGroup);

    // Renderer and Scene setup
    this.#canvas = document.querySelector('#canvas');
    this.#scene = new Scene();
    this.#scene.add(this.#allGeometriesGroup);
    this.#renderer = new WebGLRenderer({ canvas: this.#canvas });
    this.#renderer.setPixelRatio(window.devicePixelRatio);
    this.#renderer.setSize(window.innerWidth * 0.4, window.innerHeight * 0.4);
    this.#renderer.setClearColor(0xff_ff_ff);
    this.#renderer.autoClear = false;

    // Camera setup
    this.#camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // OrbitControls setup
    this.#controls = new OrbitControls(this.#camera, this.#canvas);
    this.#controls.enableDamping = true;
    this.#controls.dampingFactor = 0.25;

    // Lighting setup
    const ambientLight = new AmbientLight(0xff_ff_ff, 1);
    const directionalLight = new DirectionalLight(0xff_ff_ff, 1);
    directionalLight.position.set(0, 1, 1).normalize();

    this.#scene.add(directionalLight);
    this.#scene.add(ambientLight);

    // gizmo
    this.#viewHelper = new ViewHelper(this.#camera, this.#renderer, 'bottom-left', 64);

    // Enable Reset View function
    const resetButton = document.querySelector('#resetViewButton');
    resetButton.addEventListener('click', () => {
      this.#controls.reset();
    });
  }

  // Public Functions
  renderInitialData() {
    this.#renderFixedSpecies();
    this.#renderSpeciesFromConfig();
    this.#setViewPortAlignment();
  }

  renderDynamicData(config) {
    this.#config = config;
    this.#renderSpeciesFromConfig();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.#controls.update();
    this.#renderer.clear();
    this.#renderer.render(this.#scene, this.#camera);
    this.#viewHelper.render(this.#renderer);
  }

  // Private Functions
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
      const existingSpeciesMesh = this.#dynamicSpeciesGroup.children.find(
        child =>
          child.userData.dynamic === false &&
          child.userData.siteIndex === siteIndex &&
          child.userData.speciesIndex === speciesIndex
      );
      if (existingSpeciesMesh) {
        existingSpeciesMesh.visible = true;
        existingSpeciesMesh.userData.dynamic = true;
      } else {
        this.#createSpeciesMeshAtSite(speciesIndex, siteIndex);
      }
    }
  }

  #clearDynamicSpecies() {
    for (let i = 0; i < this.#dynamicSpeciesGroup.children.length; i++) {
      const dynamicSpeciesMesh = this.#dynamicSpeciesGroup.children.find(child => child.userData.dynamic === true);
      if (dynamicSpeciesMesh) {
        dynamicSpeciesMesh.userData.dynamic = false;
        dynamicSpeciesMesh.visible = false;
      }
    }
  }

  #createSpeciesMeshAtSite(speciesIndex, siteIndex) {
    const site = this.#sitesGroup.children[siteIndex];
    const species = new Species(site, this.#speciesDictionary[speciesIndex]);
    const speciesMesh = species.createMesh();

    speciesMesh.userData.siteIndex = siteIndex;
    speciesMesh.userData.speciesIndex = speciesIndex;

    speciesMesh.userData.dynamic = true;
    speciesMesh.visible = true;

    this.#dynamicSpeciesGroup.add(speciesMesh);
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

  #calculateYOffset() {
    let boundingBox = new Box3().setFromObject(this.#allGeometriesGroup);
    let centerPoint = new Vector3();
    boundingBox.getCenter(centerPoint);

    return -centerPoint.y;
  }

  #calculateZOffset() {
    let boundingBox = new Box3().setFromObject(this.#allGeometriesGroup);
    let centerPoint = new Vector3();
    boundingBox.getCenter(centerPoint);

    return -centerPoint.z;
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
    cameraDistance = width / 3 / Math.tan(halfFOVInRadians);
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
}
