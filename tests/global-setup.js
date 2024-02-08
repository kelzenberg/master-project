/* eslint-disable no-undef */
const jestSetup = () => {
  // BACKEND SETTINGS
  process.env.USE_HTTPS = 'false';
  process.env.NO_CONSOLE_LOGGING = 'false';
  process.env.NO_FILE_LOGGING = 'true';
  process.env.BACKEND_PORT = 3000;
  // WORKER SETTINGS
  process.env.WORKER_ACTIVE = 1;
  process.env.WORKER_DELAY = 2000;
  process.env.WORKER_RUN_FILE_PATH = 'src/worker/main.js';
  // SIMULATION SETTINGS
  process.env.CONFIG_PATH = 'src/config.json';
  process.env.SIMULATION_PORT = 3001;
  // USER CREDENTIALS
  process.env.MODERATOR_USERNAME = 'Moderator';
  process.env.MODERATOR_PASSWORD = 'foo';
  process.env.STUDENT_USERNAME = 'Student';
  process.env.STUDENT_PASSWORD = 'foo';
};

export default jestSetup;
