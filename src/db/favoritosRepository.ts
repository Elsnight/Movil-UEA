import { getDb } from './database';

export const favoritosRepository = {
  obtenerIds: async (): Promise<string[]> => {
    const db = await getDb();
    const rows = await db.getAllAsync<{ comercio_id: string }>(
      'SELECT comercio_id FROM favoritos_cache ORDER BY synced_at DESC',
    );
    return rows.map((row) => row.comercio_id);
  },

  reemplazar: async (comercioIds: string[]): Promise<void> => {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM favoritos_cache');
      for (const comercioId of comercioIds) {
        await db.runAsync(
          `INSERT INTO favoritos_cache (comercio_id, synced_at)
           VALUES (?, datetime('now'))`,
          comercioId,
        );
      }
    });
  },

  agregar: async (comercioId: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO favoritos_cache (comercio_id, synced_at)
       VALUES (?, datetime('now'))`,
      comercioId,
    );
  },

  eliminar: async (comercioId: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync(
      'DELETE FROM favoritos_cache WHERE comercio_id = ?',
      comercioId,
    );
  },
};
