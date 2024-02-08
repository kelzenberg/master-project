const bluebird = require('bluebird');
const stoppable = require('stoppable');
const path = require('node:path');
const url = require('node:url');
const { writeFileSync, readFileSync } = require('node:fs');
const { createServer: createHttpServer } = require('node:http');
const { createServer: createHttpsServer } = require('node:https');
const { createApp } = require('./app.js');
const { startSocketServer } = require('./sockets.js');
const { db } = require('./services/sqlite.js');
const { Logger } = require('./utils/logger.js');
const { loadSimConfigsFromFile, createSimControllersFromConfigs } = require('./utils/config-file.js');
const { checkIfEnvValuesExist } = require('./utils/env-values.js');

const logger = Logger({ name: 'server' });
checkIfEnvValuesExist(logger);
db.initialize();

// Reading simulation configs file & initiating SimController for them
let simConfigs;
let simControllers;
const configFilePath = path.resolve(process.env.CONFIG_PATH || 'src/config.json');
// eslint-disable-next-line unicorn/prefer-top-level-await
loadSimConfigsFromFile(configFilePath).then(simConfigList => {
  simConfigs = simConfigList;
  simControllers = createSimControllersFromConfigs(simConfigList);
});

// [DEBUG] sim configs and instances are outputted to file
if (process.env.NODE_ENV === 'development') {
  writeFileSync(
    './config-to-sim-controller.local.json',
    JSON.stringify(
      {
        input: simConfigs,
        output: simControllers,
      },
      null,
      2
    ),
    { encoding: 'utf8' }
  );
}

// check HTTP(S) mode & create matching HTTP(S) server
const createServer = async app => {
  if (process.env.USE_HTTPS === 'true') {
    const certPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), './cert/');
    logger.info(`Server running in HTTPS mode, reading certificate files from '${certPath}'`);

    try {
      const options = {
        key: readFileSync(path.resolve(certPath, 'file.pem')),
        cert: readFileSync(path.resolve(certPath, 'file.crt')),
      };

      return createHttpsServer(options, app);
    } catch (error) {
      const message = `Could not create HTTPS server with certificates from '${certPath}'`;
      logger.error(message, error);
      throw new Error(message, error);
    }
  } else {
    return createHttpServer(app);
  }
};

// ExpressJS
const expressPort = process.env.BACKEND_PORT || 3000;
const expressServer = await createServer(createApp(logger));
const stoppableServer = stoppable(
  expressServer.listen(expressPort, async () => {
    logger.info(`Server started on port ${expressPort}.`);

    // Socket.io
    try {
      await startSocketServer(expressServer, simControllers);
    } catch (error) {
      const message = 'Starting socket server failed';
      logger.error(message, error);
      throw new Error(message, error);
    }
  }),
  1000
);

const stopServerAsync = bluebird.promisify(stoppableServer.stop.bind(stoppableServer));

// Graceful shutdown --> Add server components to shutdown here
const shutdown = async () => {
  logger.info('Server and services stopping...');
  await Promise.resolve(simControllers.map(async controller => controller.pauseSim()));
  await stopServerAsync();
  await db.close();
  logger.info('Server and services stopped.');
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

module.exports = { simControllers };
