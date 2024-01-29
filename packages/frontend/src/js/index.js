import { LandingPageController } from './controllers/LandingPageController';

const landingPageController = new LandingPageController();

// hier muss stattdessen GET config.json aufgerufen werden:
const config = [
  {
    id: '9025364f-868f-4a7c-95f6-06357bfc1bab',
    title: 'Methanation',
    description: 'This is the sim for Methanation...',
  },
];

landingPageController.initializeLandingPage(config);
