import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

let db: SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLiteDatabase> {
  if (db) return db;
  db = await openDatabaseAsync('rescatefresco.db');
  await db.execAsync(SCHEMA_SQL);
  return db;
}

export const iniciarBD = getDb;

export async function cerrarDb(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

export async function reiniciarDb(): Promise<void> {
  await cerrarDb();
  const { deleteDatabaseAsync } = await import('expo-sqlite');
  await deleteDatabaseAsync('rescatefresco.db');
  db = null;
  await getDb();
}