import { getDb } from './database';
import type { OfertaCacheada } from './schema';
import { mapearOfertaACache } from './schema';
import type { Oferta } from '../services/ofertasService';

export const ofertasRepository = {
  guardarOfertas: async (ofertas: Oferta[], sucursalId?: string): Promise<void> => {
    const db = await getDb();
    const cache = ofertas.map((o) => mapearOfertaACache(o, sucursalId));

    for (const o of cache) {
      await db.runAsync(
        `INSERT OR REPLACE INTO oferta_cache (
          oferta_id, titulo_publico, descripcion, precio_original, precio_oferta,
          cantidad_disponible, unidad, estado_oferta, fecha_vencimiento, imagen_url,
          sucursal_id, comercio_id, comercio_nombre, comercio_direccion,
          comercio_latitud, comercio_longitud, created_at, synced_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, datetime('now')
        )`,
        o.oferta_id,
        o.titulo_publico,
        o.descripcion,
        o.precio_original,
        o.precio_oferta,
        o.cantidad_disponible,
        o.unidad,
        o.estado_oferta,
        o.fecha_vencimiento,
        o.imagen_url,
        o.sucursal_id,
        o.comercio_id,
        o.comercio_nombre,
        o.comercio_direccion,
        o.comercio_latitud,
        o.comercio_longitud,
        o.created_at,
      );
    }
  },

  obtenerOfertasCacheadas: async (): Promise<OfertaCacheada[]> => {
    const db = await getDb();
    const rows = await db.getAllAsync<OfertaCacheada>(
      'SELECT * FROM oferta_cache ORDER BY created_at DESC',
    );
    return rows;
  },

  obtenerAntiguedadCache: async (): Promise<string | null> => {
    const db = await getDb();
    const row = await db.getFirstAsync<{ synced_at: string }>(
      'SELECT MAX(synced_at) as synced_at FROM oferta_cache',
    );
    return row?.synced_at ?? null;
  },
};