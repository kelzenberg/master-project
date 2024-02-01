import path from 'node:path';
import url from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { v4 as uuid } from 'uuid';

sqlite3.verbose();

const createDatabase = async () =>
  open({
    filename: `${(path.dirname(url.fileURLToPath(import.meta.url)), 'database.db')}`,
    driver: sqlite3.cached.Database,
  });

export const db = await createDatabase();

const createSimulationTable = async () => {
  await db.exec('CREATE TABLE IF NOT EXISTS simulation (id TEXT PRIMARY KEY, title TEXT)');
  const insertStatement = await db.prepare("INSERT INTO simulation (id, title) VALUES ('id:TEXT', 'title:TEXT')");
  await insertStatement.run(uuid(), 'foo');
};

await createSimulationTable();
