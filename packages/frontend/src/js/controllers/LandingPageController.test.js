import { LandingPageController } from './LandingPageController';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([{ id: 1, title: 'Simulation 1', description: 'Description 1', thumbnail: 'thumbnail1.jpg' }]),
  })
);

describe('LandingPageController', () => {
  describe('initializeLandingPage', () => {
    test('should call fetchSimList and update the previewContainer', async () => {
      document.body.innerHTML = `
          <div
          class="previewContainer"
          id="previewContainer"
        ></div>
      `;
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
