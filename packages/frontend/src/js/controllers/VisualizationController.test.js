import { VisualizationController } from './VisualizationController';

jest.mock('three', () => {
  const mockDirectionalLight = jest.fn().mockImplementation(() => ({
    position: {
      set: jest.fn(),
      normalize: jest.fn(),
    },
  }));
  const mockAmbientLight = jest.fn();
  return {
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
    })),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setPixelRatio: jest.fn(),
      setSize: jest.fn(),
      setClearColor: jest.fn(),
      autoClear: false,
      render: jest.fn(),
    })),
    Vector3: jest.fn(),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { copy: jest.fn() },
      lookAt: jest.fn(),
    })),
    AmbientLight: mockAmbientLight,
    DirectionalLight: mockDirectionalLight,
    SphereGeometry: jest.fn(),
    MeshStandardMaterial: jest.fn(),
    Mesh: jest.fn().mockImplementation(() => ({
      position: { copy: jest.fn() },
    })),
    Group: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      children: [],
    })),
    Box3: jest.fn().mockImplementation(() => ({
      setFromObject: jest.fn().mockReturnThis(),
      getCenter: jest.fn(),
    })),
  };
});

jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    enableDamping: true,
    dampingFactor: 0.25,
    update: jest.fn(),
  })),
}));

jest.mock('three/examples/jsm/helpers/ViewHelper', () => ({
  ViewHelper: jest.fn().mockImplementation(() => ({
    render: jest.fn(),
  })),
}));

jest.mock('../models/Molecule', () => jest.fn());
jest.mock('../models/Species', () => jest.fn());

describe('VisualizationController', () => {
  let visualizationController;

  beforeEach(() => {
    const fixedSpecies = [];
    const config = [];
    const sitesGroup = {};
    const speciesDictionary = [];
    const typeDefinitions = {};
    visualizationController = new VisualizationController(
      fixedSpecies,
      config,
      sitesGroup,
      speciesDictionary,
      typeDefinitions
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize without errors', () => {
    expect(visualizationController).toBeDefined();
  });

  it('should have renderInitialData method', () => {
    expect(visualizationController.renderInitialData).toBeDefined();
  });

  it('should have renderDynamicData method', () => {
    expect(visualizationController.renderDynamicData).toBeDefined();
  });

  it('should have animate method', () => {
    expect(visualizationController.animate).toBeDefined();
  });
});
