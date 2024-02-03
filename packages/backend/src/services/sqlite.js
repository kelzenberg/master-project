import path from 'node:path';
import url from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import SQL from 'sql-template-strings';
import { Logger } from '../utils/logger.js';

const logger = Logger({ name: 'simulation-config-loader' });
const filePath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../database.db');

// Turn on SQLite verbosity output
// sqlite3.verbose();

const setupDatabase = async () => {
  logger.info('Loading/Creating database from file...', { data: filePath });

  const db = await open({
    filename: `${(path.dirname(url.fileURLToPath(import.meta.url)), filePath)}`,
    driver: sqlite3.cached.Database,
  });

  logger.info('Creating database tables...');
  db.exec('CREATE TABLE IF NOT EXISTS simulation (id TEXT PRIMARY KEY, envKeyForURL TEXT)');

  logger.info('Successfully setup database');
  return db;
};

const dbInstance = await setupDatabase();

const insertSim = async ({ id, envKeyForURL }) => {
  logger.info(`Adding simulation details to simulation table for ID ${id} ...`, { data: { id, envKeyForURL } });
  const existingRow = await dbInstance.get(SQL`SELECT id FROM simulation WHERE id = ${id}`);

  if (existingRow) {
    logger.warn(`Row for ID ${id} already exists. Updating row instead...`, { data: filePath });

    const statement = await dbInstance.prepare(
      SQL`UPDATE simulation SET id = ${id}, envKeyForURL = ${envKeyForURL} WHERE id = ${id}`
    );
    const result = await statement.run();

    logger.info(`Updated row in simulation table for ID ${id}`);
    return result;
  }

  const statement = await dbInstance.prepare(
    SQL`INSERT INTO simulation (id, envKeyForURL) VALUES (${id},${envKeyForURL})`
  );
  const result = await statement.run();

  logger.info(`Inserted new row into simulation table for ID ${id}`, { data: { id, envKeyForURL } });
  return result;
};

export const db = { instance: dbInstance, insertSim };
