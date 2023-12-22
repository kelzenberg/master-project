/** @type {import('three')} */ // Types for ThreeJS
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
  Object3D,
  Box3,
  BufferGeometry,
  Line,
  LineBasicMaterial,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import Molecule from './models/Molecule';
import Species from './models/Species';

const sitesGroup = new Group();
const speciesList = [];
const allGeometriesGroup = new Group();
var typeDefinitions = {};

// Renderer and Scene setup
const canvas = document.querySelector('#canvas');
const scene = new Scene();
scene.add(allGeometriesGroup);
const renderer = new WebGLRenderer({ canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.4, window.innerHeight * 0.4);
renderer.setClearColor(0xff_ff_ff);

// Camera setup
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// OrbitControls setup
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
//controls.saveState();

// Lighting setup
const ambientLight = new AmbientLight(0xff_ff_ff, 1);
const directionalLight = new DirectionalLight(0xff_ff_ff, 1);
directionalLight.position.set(0, 0, 1).normalize();

scene.add(directionalLight);
scene.add(ambientLight);

// Enable Reset View function
const resetButton = document.querySelector('#resetViewButton');
resetButton.addEventListener('click', () => {
  controls.reset();
});

// Setup Functions
function readSites(jsonData) {
  for (const data of jsonData) {
    let site = new Vector3(data.x, data.y, data.z);
    let siteObject = new Object3D();
    siteObject.position.copy(site);
    sitesGroup.add(siteObject);
    allGeometriesGroup.add(sitesGroup);
  }
}

function readSpecies(jsonData) {
  for (const data of jsonData) {
    let species = [];
    for (const molecule of data) {
      let position = new Vector3(molecule.x, molecule.y, molecule.z);
      let type = molecule.type;
      let radius = typeDefinitions[type].radius;
      let color = typeDefinitions[type].color;
      let moleculeObject = new Molecule(position, radius, color);
      species.push(moleculeObject);
    }
    speciesList.push(species);
  }
}

// Render Functions
function renderFixedSpecies(jsonData) {
  for (const data of jsonData) {
    let molecule = createMolecule(data);
    const sphereGeometry = new SphereGeometry(molecule.sphereRadius, 32, 32);
    const sphereMaterial = new MeshStandardMaterial({
      color: new Color(molecule.rgb.x, molecule.rgb.y, molecule.rgb.z),
    });
    const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.copy(molecule.position);

    allGeometriesGroup.add(sphereMesh); // Add to the new group
  }
}

function createMolecule(data) {
  let position = new Vector3(data.x, data.y, data.z);
  let type = data.type;
  let radius = typeDefinitions[type].radius;
  let color = typeDefinitions[type].color;
  return new Molecule(position, radius, color);
}

function renderSpeciesFromConfig(jsonData) {
  clearDynamicSpecies();

  for (const [index, data] of jsonData.entries()) {
    let molecules = speciesList[data];
    let site = sitesGroup.children[index];
    let species = new Species(site, molecules);
    const speciesMesh = species.createMesh();
    speciesMesh.userData.dynamic = true;

    allGeometriesGroup.add(speciesMesh);
  }
}

function clearDynamicSpecies() {
  for (let i = allGeometriesGroup.children.length - 1; i >= 0; i--) {
    const child = allGeometriesGroup.children[i];

    if (child.userData && child.userData.dynamic) {
      allGeometriesGroup.remove(child);

      if (child instanceof Mesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    }
  }
}

function calculateXOffset(jsonData) {
  let maxX = Number.NEGATIVE_INFINITY;
  let minX = Number.POSITIVE_INFINITY;

  for (const data of jsonData) {
    let molecule = createMolecule(data);
    let x = molecule.position.x;

    // Update maxX and minX based on current molecule's x value
    maxX = Math.max(maxX, x);
    minX = Math.min(minX, x);
  }

  // Calculate the centerPoint based on maxX and minX
  let centerPoint = new Vector3();
  centerPoint.x = (maxX + minX) / 2;
  centerPoint.y = 0; // You can adjust this based on your scene requirements
  centerPoint.z = 0; // You can adjust this based on your scene requirements

  return -maxX + centerPoint.x;
}

function calculateZOffset() {
  let boundingBox = new Box3().setFromObject(allGeometriesGroup);
  let centerPoint = new Vector3();
  boundingBox.getCenter(centerPoint);

  return -centerPoint.z;
}

function calculateYOffset() {
  let boundingBox = new Box3().setFromObject(allGeometriesGroup);
  let centerPoint = new Vector3();
  boundingBox.getCenter(centerPoint);

  return -centerPoint.y;
}

function setCameraToFitBoundingBox() {
  let distance = determinCameraDistance();
  let newPosition = new Vector3(0, distance, distance);

  camera.position.copy(newPosition);
  camera.lookAt(new Vector3(0, 0, 0));
  controls.saveState();
}

function determinCameraDistance() {
  let cameraDistance;
  let halfFOVInRadians = getRadians(camera.fov / 2);
  let { width } = getObjectSize(allGeometriesGroup);
  cameraDistance = width / 2 / Math.tan(halfFOVInRadians);
  return cameraDistance;
}

function getObjectSize(target) {
  let box = new Box3().setFromObject(target);
  let size = {
    depth: -1 * box.min.z + box.max.z,
    height: -1 * box.min.y + box.max.y,
    width: -1 * box.min.x + box.max.x,
  };
  return size;
}

function getRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function renderInitialData(jsonFile) {
  fetch(jsonFile)
    .then(response => response.json())
    .then(jsonData => {
      typeDefinitions = jsonData.visualization.typeDefinitions;
      let sites = jsonData.visualization.sites;
      let species = jsonData.visualization.species;
      let fixedSpecies = jsonData.visualization.fixedSpecies;
      let config = jsonData.visualization.config;

      readSites(sites);
      readSpecies(species);
      renderFixedSpecies(fixedSpecies);
      renderSpeciesFromConfig(config);

      const rotationAngleX = -Math.PI / 2; // -90 degrees in radians
      allGeometriesGroup.rotation.set(rotationAngleX, 0, 0);

      let xOffset = calculateXOffset(fixedSpecies);
      let yOffset = calculateYOffset();
      let zOffset = calculateZOffset();
      let offset = new Vector3(xOffset, yOffset, zOffset);
      setCameraToFitBoundingBox();
      allGeometriesGroup.position.copy(offset);
    });
}

// eslint-disable-next-line no-unused-vars
function renderDynamicData(jsonFile) {
  fetch(jsonFile)
    .then(response => response.json())
    .then(jsonData => {
      let config = jsonData.visualization.config;
      renderSpeciesFromConfig(config);
    });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

if (WebGL.isWebGLAvailable()) {
  // Function Calls
  gizmo();
  renderInitialData('data/new-json-data-format/initial-data.json');
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.querySelector('body').append(warning);
}

function gizmo() {
  const lineLength = 100;

  const xAxisGeometry = new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(lineLength, 0, 0)]);
  const yAxisGeometry = new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0, lineLength, 0)]);
  const zAxisGeometry = new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, lineLength)]);

  const xAxisMaterial = new LineBasicMaterial({ color: 0xff_00_00 }); // Red
  const yAxisMaterial = new LineBasicMaterial({ color: 0x00_00_ff }); // Blue
  const zAxisMaterial = new LineBasicMaterial({ color: 0x00_ff_00 }); // Green

  const xAxisLine = new Line(xAxisGeometry, xAxisMaterial);
  const yAxisLine = new Line(yAxisGeometry, yAxisMaterial);
  const zAxisLine = new Line(zAxisGeometry, zAxisMaterial);

  // Position lines at the centerpoint
  const centerPoint = new Vector3();
  allGeometriesGroup.getWorldPosition(centerPoint);
  xAxisLine.position.copy(centerPoint);
  yAxisLine.position.copy(centerPoint);
  zAxisLine.position.copy(centerPoint);

  // Add axes lines to the scene
  scene.add(xAxisLine);
  scene.add(yAxisLine);
  scene.add(zAxisLine);
}
