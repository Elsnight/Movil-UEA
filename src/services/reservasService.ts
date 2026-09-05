import { api } from './api';

export type Reserva = {
  id: string;
  usuarioId: string;
  ofertaId: string;
  cantidad: number;
  codigoRetiro: string;
  estado: string;
  createdAt: string;
  oferta: {
    id: string;
    titulo: string;
    precioOferta: number;
    imagenUrl?: string;
    comercio: { id: string; nombre: string; direccion: string };
  };
};

function extraerLista(respuesta: unknown): Reserva[] {
  if (Array.isArray(respuesta)) return respuesta;
  if (respuesta && typeof respuesta === 'object' && 'data' in (respuesta as Record<string, unknown>) && Array.isArray((respuesta as Record<string, unknown>).data)) {
    return (respuesta as Record<string, unknown>).data as Reserva[];
  }
  return [];
}

export const reservasService = {
  listar: async () => {
    const res = await api.get<{ success: boolean; data: unknown }>('/api/reservas/mias');
    return extraerLista(res.data.data);
  },
  crear: async (data: { ofertaId: string; cantidad: number }) => {
    const res = await api.post<{ success: boolean; data: Reserva }>('/api/reservas', {
      oferta_id: data.ofertaId,
      cantidad: data.cantidad,
    });
    return res.data.data;
  },
};