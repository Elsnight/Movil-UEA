import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

let db: SQLiteDatabase | null = null;
let dbPromise: Promise<SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLiteDatabase> {
  if (db) return db;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const database = await openDatabaseAsync('rescatefresco.db');
    await database.execAsync(SCHEMA_SQL);
    db = database;
    return database;
  })();

  try {
    return await dbPromise;
  } finally {
    dbPromise = null;
  }
}

export const iniciarBD = getDb;

export async function cerrarDb(): Promise<void> {
  if (dbPromise) await dbPromise;
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export async function reiniciarDb(): Promise<void> {
  const database = await getDb();
  await database.withTransactionAsync(async () => {
    await database.execAsync(`
      DROP TABLE IF EXISTS pending_operations;
      DROP TABLE IF EXISTS oferta_cache;
      ${SCHEMA_SQL}
    `);
  });
}
