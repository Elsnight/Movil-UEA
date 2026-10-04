import { api, unwrapApiResponse, type ApiResult } from './api';

export type OfertaResumida = {
  id: string;
  titulo: string;
  precioOferta: number;
  imagenUrl?: string;
  comercio: { id: string; nombre: string; direccion: string };
};

export type ReservaItem = {
  oferta_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal_linea: number;
  oferta: OfertaResumida;
};

export type Reserva = {
  id: string;
  reserva_id: string;
  usuarioId: string;
  sucursal_id: string;
  codigo_retiro: string;
  estado: string;
  total_pagar: number;
  items: ReservaItem[];
  oferta: OfertaResumida;
  createdAt: string;
};

type Envelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

export type CrearReservaInput = {
  sucursal_id: string;
  items: { oferta_id: string; cantidad: number }[];
};

export const reservasService = {
  listar: async (): Promise<ApiResult<Reserva[]>> => {
    const res = await api.get<Envelope<Reserva[]>>('/api/reservas/mias');
    return unwrapApiResponse(res.data);
  },

  crear: async (data: CrearReservaInput): Promise<ApiResult<Reserva>> => {
    const res = await api.post<Envelope<Reserva>>('/api/reservas', data);
    return unwrapApiResponse(res.data);
  },
};