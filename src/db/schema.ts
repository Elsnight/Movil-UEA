import type { Oferta } from '../services/ofertasService';

export type OfertaCacheada = {
  oferta_id: string;
  titulo_publico: string;
  descripcion: string;
  precio_original: number;
  precio_oferta: number;
  cantidad_disponible: number;
  unidad: string;
  estado_oferta: string;
  fecha_vencimiento: string;
  imagen_url: string | null;
  sucursal_id: string;
  comercio_id: string;
  comercio_nombre: string;
  comercio_direccion: string;
  comercio_latitud: number;
  comercio_longitud: number;
  created_at: string;
  synced_at: string;
};

export type PendingOperation = {
  id: string;
  tipo_operacion: string;
  entidad: string;
  payload: string;
  estado: 'pendiente' | 'enviando' | 'fallido';
  intentos: number;
  creado_en: string;
  ultimo_intento_en: string | null;
};

export function mapearOfertaACache(
  oferta: Oferta,
  sucursalId?: string,
): OfertaCacheada {
  return {
    oferta_id: oferta.id,
    titulo_publico: oferta.titulo,
    descripcion: oferta.descripcion,
    precio_original: oferta.precioOriginal,
    precio_oferta: oferta.precioOferta,
    cantidad_disponible: oferta.cantidadDisponible,
    unidad: oferta.unidad,
    estado_oferta: oferta.estado,
    fecha_vencimiento: oferta.fechaVencimiento,
    imagen_url: oferta.imagenUrl ?? null,
    sucursal_id: sucursalId ?? '',
    comercio_id: oferta.comercio.id,
    comercio_nombre: oferta.comercio.nombre,
    comercio_direccion: oferta.comercio.direccion,
    comercio_latitud: oferta.comercio.latitud,
    comercio_longitud: oferta.comercio.longitud,
    created_at: oferta.createdAt,
    synced_at: new Date().toISOString(),
  };
}

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS oferta_cache (
  oferta_id TEXT PRIMARY KEY,
  titulo_publico TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  precio_original REAL NOT NULL,
  precio_oferta REAL NOT NULL,
  cantidad_disponible INTEGER NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL DEFAULT '',
  estado_oferta TEXT NOT NULL DEFAULT 'DISPONIBLE',
  fecha_vencimiento TEXT NOT NULL DEFAULT '',
  imagen_url TEXT,
  sucursal_id TEXT NOT NULL DEFAULT '',
  comercio_id TEXT NOT NULL DEFAULT '',
  comercio_nombre TEXT NOT NULL DEFAULT '',
  comercio_direccion TEXT NOT NULL DEFAULT '',
  comercio_latitud REAL NOT NULL DEFAULT 0,
  comercio_longitud REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT '',
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pending_operations (
  id TEXT PRIMARY KEY,
  tipo_operacion TEXT NOT NULL,
  entidad TEXT NOT NULL,
  payload TEXT NOT NULL DEFAULT '{}',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviando', 'fallido')),
  intentos INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  ultimo_intento_en TEXT
);

CREATE TABLE IF NOT EXISTS favoritos_cache (
  comercio_id TEXT PRIMARY KEY,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pending_operations_estado ON pending_operations(estado);
CREATE INDEX IF NOT EXISTS idx_pending_operations_creado ON pending_operations(creado_en);
CREATE INDEX IF NOT EXISTS idx_oferta_cache_synced ON oferta_cache(synced_at);
`;
