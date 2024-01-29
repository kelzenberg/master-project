import { LandingPageController } from './controllers/LandingPageController';

const landingPageController = new LandingPageController();

// hier muss stattdessen GET /list aufgerufen werden, um die config.json zu getten:
try {
  const response = await fetch('./data/config.json');
  const config = await response.json();
  console.log('config');
  landingPageController.initializeLandingPage(config);
  console.log('finished fetching');
} catch (error) {
  console.error(error);
}
