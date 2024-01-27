export const delayFor = (ms, logger) =>
  new Promise(resolve =>
    setTimeout(() => {
      if (logger) {
        logger.debug(`Delaying script execution for ${ms / 1000} seconds...`);
      }
      resolve();
    }, ms)
  );
