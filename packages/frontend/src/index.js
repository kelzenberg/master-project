/** @type {import('three')} */ // Types for ThreeJS
import {
  Scene,
  WebGLRenderer,
  Vector3,
  PerspectiveCamera,
  Euler,
  AmbientLight,
  DirectionalLight,
  SphereGeometry,
  MeshStandardMaterial,
  Color,
  Mesh,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import Molecule from './models/Molecule';
import Species from './models/Species';

const sites = [];
const speciesList = [];

// Renderer and Scene setup
const canvas = document.querySelector('#canvas');
const scene = new Scene();
const renderer = new WebGLRenderer({ canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.4, window.innerHeight * 0.4);
renderer.setClearColor(0xff_ff_ff);

// Camera setup
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const defaultCameraPosition = new Vector3(0, -40, 50); // 0, -40, 50
const defaultCameraRotation = new Euler(0, 0, 0);
camera.position.copy(defaultCameraPosition);
camera.rotation.copy(defaultCameraRotation);

// OrbitControls setup
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.saveState();

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
    sites.push(site);
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

    scene.add(sphereMesh);
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
  for (const [index, data] of jsonData.entries()) {
    let molecules = speciesList[data];
    let site = sites[index];
    let species = new Species(site, molecules);
    const speciesMesh = species.createMesh();
    scene.add(speciesMesh);
  }
}

var typeDefinitions = {};

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
  renderInitialData('data/new-json-data-format/initial-data.json');
  //  renderDynamicData('new-json-data-format/dynamic-data.json');
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.querySelector('body').append(warning);
}


