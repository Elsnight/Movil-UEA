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

type RailwayEnvelope<T> = { success: boolean; data: T };

export const reservasService = {
  listar: async () => {
    const res = await api.get<RailwayEnvelope<Reserva[]>>('/api/reservas/mias');
    return res.data.data;
  },
  crear: async (data: { ofertaId: string; cantidad: number }) => {
    const res = await api.post<RailwayEnvelope<Reserva>>('/api/reservas', {
      oferta_id: data.ofertaId,
      cantidad: data.cantidad,
    });
    return res.data.data;
  },
};