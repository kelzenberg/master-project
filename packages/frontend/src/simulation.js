import Plotly from 'plotly.js-dist';
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
  AxesHelper,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import WebGL from 'three/examples/jsm/capabilities/WebGL';
import Molecule from './models/Molecule';
import Species from './models/Species';

const sitesGroup = new Group();
const speciesList = [];
const allGeometriesGroup = new Group();
var plotData = {};
var typeDefinitions = {};

// Renderer and Scene setup
const canvas = document.querySelector('#canvas');
const scene = new Scene();
scene.add(allGeometriesGroup);
const renderer = new WebGLRenderer({ canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth * 0.4, window.innerHeight * 0.4);
renderer.setClearColor(0xff_ff_ff);

//gizmo
var axesHelper = new AxesHelper(100);
scene.add(axesHelper);

// Camera setup
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// OrbitControls setup
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

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
      color: new Color(molecule.color.x, molecule.color.y, molecule.color.z),
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

      //plots
      plotData = jsonData.plots;

      readSites(sites);
      readSpecies(species);
      renderFixedSpecies(fixedSpecies);
      renderSpeciesFromConfig(config);
      setupInitialPlotData(plotData);
      setupInitialPlotLayouts();

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
  renderInitialData('data/new-json-data-format/initial-data.json');
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.querySelector('body').append(warning);
}

//
//
//
//
//
//
//
//
// TEST PLOT INTEGRATION
const maxStoredDataPoints = 50;
var initialDataTOF;
var initialDataCoverage;
var tofNumGraphs;
var coverageNumGraphs;
const layout = {
  title: 'TOF',
  xaxis: {
    title: 'kmc time',
  },
  yaxis: {
    title: 'Value',
  },
  hovermode: 'x',
};

function setupInitialPlotData(plots) {
  // Set up initial data for each graph
  tofNumGraphs = plots.tof.length;
  coverageNumGraphs = plots.coverage.length;
  const tofColors = getColors(tofNumGraphs);
  const coverageColors = getColors(coverageNumGraphs);
  const tofLabels = getTofLabels(plots);
  const coverageLabels = getCoverageLabels(plots);

  // hier muss als initial x-value plotData.kmcTime gesetzt werden und y = plotData[index].values[0] (default)
  initialDataTOF = Array.from({ length: tofNumGraphs }, (_, index) => ({
    x: [0],
    y: [getRandomData()],
    type: 'line',
    mode: 'lines+markers',
    line: {
      color: tofColors[index],
    },
    name: tofLabels[index],
  }));

  // hier muss als initial x-value plotData.kmcTime gesetzt werden und y = calculateAverage(plotData[index].values)
  initialDataCoverage = Array.from({ length: coverageNumGraphs }, (_, index) => ({
    x: [0],
    y: [getRandomData()],
    type: 'line',
    mode: 'lines+markers',
    line: {
      color: coverageColors[index],
    },
    name: coverageLabels[index],
  }));
}

function getColors(numGraphs) {
  const colors = new Set();

  while (colors.size < numGraphs) {
    const color = '#' + Math.floor(Math.random() * 16_777_215).toString(16);
    colors.add(color);
  }

  return [...colors];
}

function getTofLabels(plots) {
  return plots.tof.map(tofObject => {
    const label = tofObject.label;
    return label;
  });
}

function getCoverageLabels(plots) {
  return plots.coverage.map(coverageObject => {
    const label = coverageObject.averageLabel;
    return label;
  });
}

// hier muss plots.plotData mitgegeben werden, sodass x und y values dynamisch gesetzt werden können (kmcTime, values)
function setupInitialPlotLayouts() {
  // Set up the initial plot with TOF Graphs
  Plotly.newPlot('plotTOF', initialDataTOF, layout).then(plotTOF => {
    // Store the initial Graphs for later use
    const initialGraphsTOF = [...plotTOF.data];

    // Duplicate the layout for Coverage plot
    const layoutCoverage = { ...layout, title: 'Coverage' };

    // Set up the initial plot with Coverage Graphs
    Plotly.newPlot('plotCoverage', initialDataCoverage, layoutCoverage).then(plotCoverage => {
      // Store the initial Graphs for later use
      const initialGraphsCoverage = [...plotCoverage.data];

      let i = 1; // Initial x-axis value

      // Update the plots in real-time
      setInterval(() => {
        // Update each TOF graph with new data
        for (let tofGraphIndex = 0; tofGraphIndex < tofNumGraphs; tofGraphIndex++) {
          const graphTOF = initialGraphsTOF[tofGraphIndex];
          graphTOF.x.push(i);
          graphTOF.y.push(getRandomData());

          // Remove oldest data points if the limit is reached
          if (graphTOF.x.length > maxStoredDataPoints) {
            graphTOF.x.shift();
            graphTOF.y.shift();
          }
        }

        // Update each Coverage graph with new data
        for (let coverageGraphIndex = 0; coverageGraphIndex < coverageNumGraphs; coverageGraphIndex++) {
          const graphCoverage = initialGraphsCoverage[coverageGraphIndex];
          graphCoverage.x.push(i);
          graphCoverage.y.push(getRandomData());

          // Remove oldest data points if the limit is reached
          if (graphCoverage.x.length > maxStoredDataPoints) {
            graphCoverage.x.shift();
            graphCoverage.y.shift();
          }
        }

        // Update the TOF plot with new data
        Plotly.update('plotTOF', initialGraphsTOF, layout);

        // Update the Coverage plot with new data
        Plotly.update('plotCoverage', initialGraphsCoverage, layoutCoverage);

        i++;
      }, 1000); // Update every 1 second
    });
  });
}

// Automatic panning with data being discarded
// Function to generate random data
function getRandomData() {
  return Math.random();
}

// eslint-disable-next-line no-unused-vars
function calculateAverage(array) {
  var sum = array.reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0);

  return sum / array.length;
}
