import { api } from './api';

export type Oferta = {
  id: string;
  titulo: string;
  descripcion: string;
  precioOriginal: number;
  precioOferta: number;
  cantidadDisponible: number;
  unidad: string;
  estado: string;
  fechaVencimiento: string;
  imagenUrl?: string;
  comercio: { id: string; nombre: string; direccion: string; latitud: number; longitud: number };
  createdAt: string;
};

type RailwayEnvelope<T> = { success: boolean; data: T };

function extraerLista(respuesta: unknown): Oferta[] {
  if (Array.isArray(respuesta)) return respuesta;
  if (respuesta && typeof respuesta === 'object' && 'data' in (respuesta as Record<string, unknown>) && Array.isArray((respuesta as Record<string, unknown>).data)) {
    return (respuesta as Record<string, unknown>).data as Oferta[];
  }
  return [];
}

export const ofertasService = {
  listar: async (params?: Record<string, string | number | undefined>) => {
    const res = await api.get<RailwayEnvelope<unknown>>('/api/ofertas', { params });
    return extraerLista(res.data.data);
  },
  obtenerPorId: async (id: string) => {
    const res = await api.get<RailwayEnvelope<Oferta>>(`/api/ofertas/${id}`);
    return res.data.data;
  },
};