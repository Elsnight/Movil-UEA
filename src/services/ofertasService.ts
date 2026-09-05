import { api } from './api';

export type Oferta = {
  id: string;
  titulo: string;
  descripcion: string;
  precioOriginal: number;
  precioOferta: number;
  cantidadDisponible: number;
  unidad: string;
  estado: 'DISPONIBLE' | 'PAUSADA' | 'AGOTADA' | 'EXPIRADA';
  fechaVencimiento: string;
  imagenUrl?: string;
  comercio: { id: string; nombre: string; direccion: string; latitud: number; longitud: number };
  createdAt: string;
};

type RailwayEnvelope<T> = { success: boolean; data: T };

export const ofertasService = {
  listar: async (params?: Record<string, string | number | undefined>) => {
    const res = await api.get<RailwayEnvelope<Oferta[]>>('/api/ofertas', { params });
    return res.data.data;
  },
  obtenerPorId: async (id: string) => {
    const res = await api.get<RailwayEnvelope<Oferta>>(`/api/ofertas/${id}`);
    return res.data.data;
  },
  crear: async (data: Record<string, unknown>) => {
    const res = await api.post<RailwayEnvelope<Oferta>>('/api/ofertas', data);
    return res.data.data;
  },
};