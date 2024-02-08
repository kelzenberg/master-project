import path from 'node:path';
import url from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import SQL from 'sql-template-strings';
import { Logger } from '../utils/logger.js';

const logger = Logger({ name: 'database-sqlite' });
const filePath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../database.db');

// Turn on SQLite verbosity output
// sqlite3.verbose();

let dbInstance;

const initialize = () => {
  logger.info('Initializing database from file...', { data: filePath });

  open({
    filename: `${(path.dirname(url.fileURLToPath(import.meta.url)), filePath)}`,
    driver: sqlite3.cached.Database,
  })
    .then(db => {
      logger.info('Creating database tables...');
      db.exec('CREATE TABLE IF NOT EXISTS simulation (envKeyForURL TEXT PRIMARY KEY, uuid TEXT)');
      return db;
    })
    .then(db => {
      dbInstance = db;
      logger.info('Successfully initialized database');
    })
    .catch(error => {
      const message = 'Initializing database failed';
      logger.error(message, error);
      throw new Error(message, error);
    });
};

const close = async () => dbInstance.close();

const checkReadiness = async () => dbInstance.exec(SQL`SELECT 1`);

const getAll = async () => dbInstance.all(SQL`SELECT * FROM simulation`);

const upsertOne = async ({ envKeyForURL, uuid }) => {
  logger.info(`Adding simulation details to simulation table for envKey ${envKeyForURL} ...`, {
    data: { uuid, envKeyForURL },
  });

  const existingRow = await dbInstance.get(
    SQL`SELECT envKeyForURL FROM simulation WHERE envKeyForURL = ${envKeyForURL}`
  );

  if (existingRow) {
    logger.warn(`Row for envKey ${envKeyForURL} already exists. Updating row instead...`);

    const statement = await dbInstance.prepare(
      SQL`UPDATE simulation SET envKeyForURL = ${envKeyForURL}, uuid = ${uuid} WHERE envKeyForURL = ${envKeyForURL}`
    );
    const result = await statement.run();

    logger.info(`Updated row in simulation table for envKey ${envKeyForURL}`);
    return result;
  }

  const statement = await dbInstance.prepare(
    SQL`INSERT INTO simulation (envKeyForURL, uuid) VALUES (${envKeyForURL}, ${uuid})`
  );
  const result = await statement.run();

  logger.info(`Inserted new row into simulation table for envKey ${envKeyForURL}`);
  return result;
};

const deleteOne = async ({ envKeyForURL }) => {
  logger.info(`Deleting simulation details from simulation table for envKey ${envKeyForURL} ...`, {
    data: { envKeyForURL },
  });

  const statement = await dbInstance.prepare(SQL`DELETE FROM simulation WHERE envKeyForURL = ${envKeyForURL}`);
  const result = await statement.run();

  logger.info(`Deleted row from simulation table for envKey ${envKeyForURL}`);
  return result;
};

export const db = { initialize, close, checkReadiness, getAll, upsertOne, deleteOne };
