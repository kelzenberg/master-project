import { LandingPageController } from '../js/controllers/LandingPageController';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([{ id: 1, title: 'Simulation 1', description: 'Description 1', thumbnail: 'thumbnail1.jpg' }]),
  })
);

// Create a mock for document.querySelector
document.querySelector = jest.fn(() => ({
  append: jest.fn(),
  setAttribute: jest.fn(),
  style: {},
}));

describe('LandingPageController', () => {
  describe('initializeLandingPage', () => {
    test('should call fetchSimList and update the previewContainer', async () => {
      const controller = new LandingPageController();
      await controller.initializeLandingPage();

      // Check if fetchSimList is called
      expect(global.fetch).toHaveBeenCalledWith('/list', { method: 'GET' });

      // Check if document.querySelector and related methods are called
      expect(document.querySelector).toHaveBeenCalledWith('#previewContainer');
      expect(document.querySelector().append).toHaveBeenCalled();
      expect(document.querySelector().setAttribute).toHaveBeenCalledWith('title', 'Simulation 1');
      expect(document.querySelector().setAttribute).toHaveBeenCalledWith('description', 'Description 1');
      expect(document.querySelector().setAttribute).toHaveBeenCalledWith('href', './simulation.html?id=1');
      expect(document.querySelector().style.backgroundImage).toBe(`url("thumbnail1.jpg")`);
    });
  });
});
