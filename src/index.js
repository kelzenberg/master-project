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
import Molecule from './models/Molecule';
import Species from './models/Species';

const sites = [];
const speciesList = [];

// Renderer and Scene setup
const scene = new Scene();
const renderer = new WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xff_ff_ff);
document.body.append(renderer.domElement);

// Camera setup
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const defaultCameraPosition = new Vector3(0, -40, 50); // 0, -40, 50
const defaultCameraRotation = new Euler(0, 0, 0);
camera.position.copy(defaultCameraPosition);
camera.rotation.copy(defaultCameraRotation);

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
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
function readSites(jsonFile) {
  fetch(jsonFile)
    .then(response => response.json())
    .then(jsonData => {
      for (const data of jsonData) {
        let site = new Vector3(data[0], data[1], data[2]);
        sites.push(site);
      }
    });
}

function readSpecies(jsonFile) {
  fetch(jsonFile)
    .then(response => response.json())
    .then(jsonData => {
      for (const data of jsonData) {
        let species = [];
        for (const molecule of data) {
          let position = new Vector3(molecule[0], molecule[1], molecule[2]);
          let moleculeObject = new Molecule(position, molecule[3], molecule[4]);
          species.push(moleculeObject);
        }
        speciesList.push(species);
      }
    });
}

// Render Functions

// Später wird es eine Funktion geben renderInitialData(jsonData) (diese wird 1x am Anfang aufgerufen)
// und eine Funktion renderDynamicData(jsonData) (diese wird dann pro step 1x aufgerufen)

// in renderInitialData:
// hier wird einfach nur das initialData json-object anstatt dem filepath mitgegeben:
// darin kann dann über initialData.species, initialData.sites, initialData.fixedSpecies, initialData.config auf die Werte zugegriffen werden
// diese arrays/objects werden dann an die jeweiligen functions readSpecies(initialData.species), readSites(initialData.sites), renderFixedSpecies(initialData.fixedSpecies), renderSpeciesFromConfig(initialData.config) übergeben.
// hierbei ist die aufrufreihenfolge wichtig, da die render functions auf die ergebnisse von den beiden read functions angewiesen sind!
// in diesen Methoden bleibt die Logik dann 1:1 gleich, wie sie jetzt aktuell ist, außer, dass der folgende Aufruf wegfällt:
//
//   fetch(jsonFile)
//      .then(response => response.json())
//      .then(jsonData => { ...
//
// Stattdessen können wir dort dann direkt mit jsonData.forEach() weiterarbeiten!
//
// Das selbe gilt für renderDynamicData:
// Hier wird einfach das dynamicData json-object mitgegeben anstatt dem filepath
// und dann bspw. dynamicData.config and renderSpeciesFromConfig übergeben
// hier bleibt die Logik ebenfalls 1:1 gleich, außer, dass auch hier der Aufruf von fetch(jsonFile) wegfällt.
// Stattdessen wird hier dann wieder direkt mit jsonData.forEach() gearbeitet

function renderFixedSpecies(jsonFile) {
  fetch(jsonFile)
    .then(response => response.json())
    .then(jsonData => {
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
    });
}

function createMolecule(data) {
  let position = new Vector3(data[0], data[1], data[2]);
  let sphereRadius = data[3];
  let rgbArray = data[4];
  return new Molecule(position, sphereRadius, rgbArray);
}

function renderSpeciesFromConfig(jsonFile) {
  fetch(jsonFile)
    .then(response => response.json())
    .then(jsonData => {
      for (const [index, data] of jsonData.entries()) {
        let molecules = speciesList[data];
        let site = sites[index];
        let species = new Species(site, molecules);
        const speciesMesh = species.createMesh();
        scene.add(speciesMesh);
      }
    });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Function Calls
readSites('data/examples/sites.json');
readSpecies('data/examples/species.json');
renderFixedSpecies('data/examples/fixed_species.json');
renderSpeciesFromConfig('data/examples/config_1e6.json'); // Dieser Aufruf muss dann mehrmals die Sekunde (steps/s) erfolgen und die config vom Backend abfragen
animate();
