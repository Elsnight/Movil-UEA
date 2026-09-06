import { getDb } from './database';
import type { PendingOperation } from './schema';

export const pendingRepository = {
  insertar: async (op: Omit<PendingOperation, 'estado' | 'intentos' | 'ultimo_intento_en'>): Promise<void> => {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO pending_operations (id, tipo_operacion, entidad, payload, estado, intentos, creado_en)
       VALUES (?, ?, ?, ?, 'pendiente', 0, datetime('now'))`,
      op.id,
      op.tipo_operacion,
      op.entidad,
      op.payload,
    );
  },

  obtenerPendientes: async (): Promise<PendingOperation[]> => {
    const db = await getDb();
    const rows = await db.getAllAsync<PendingOperation>(
      `SELECT * FROM pending_operations
       WHERE estado IN ('pendiente', 'fallido') AND intentos < 5
       ORDER BY creado_en ASC`,
    );
    return rows;
  },

  marcarEnviando: async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync(
      `UPDATE pending_operations SET estado = 'enviando' WHERE id = ?`,
      id,
    );
  },

  eliminar: async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync('DELETE FROM pending_operations WHERE id = ?', id);
  },

  incrementarIntentos: async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync(
      `UPDATE pending_operations SET intentos = intentos + 1, ultimo_intento_en = datetime('now') WHERE id = ?`,
      id,
    );
  },

  marcarFallido: async (id: string): Promise<void> => {
    const db = await getDb();
    await db.runAsync(
      `UPDATE pending_operations SET estado = 'fallido', ultimo_intento_en = datetime('now') WHERE id = ?`,
      id,
    );
  },

  contarFallidos: async (): Promise<number> => {
    const db = await getDb();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM pending_operations WHERE estado = 'fallido'`,
    );
    return row?.count ?? 0;
  },
};