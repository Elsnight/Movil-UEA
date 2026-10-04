import { api, unwrapApiResponse, type ApiResult } from './api';

export type Oferta = {
  id: string;
  titulo: string;
  descripcion: string;
  precioOriginal: number;
  precioOferta: number;
  cantidadDisponible: number;
  sucursal: { id: string };
  unidad: string;
  estado: string;
  fechaVencimiento: string;
  imagenUrl?: string;
  comercio: { id: string; nombre: string; direccion: string; latitud: number; longitud: number };
  createdAt: string;
};

type OfertaPaginada = {
  pagina: number;
  limite: number;
  total: number;
  total_paginas: number;
};

export type OfertaListaResultado = ApiResult<Oferta[], OfertaPaginada>;
type Envelope<T> = { success: boolean; data: T; meta?: OfertaPaginada };

export const ofertasService = {
  listar: async (params?: Record<string, string | number | undefined>): Promise<OfertaListaResultado> => {
    const res = await api.get<Envelope<Oferta[]>>('/api/ofertas', { params });
    return unwrapApiResponse(res.data);
  },
  obtenerPorId: async (id: string): Promise<ApiResult<Oferta>> => {
    const res = await api.get<Envelope<Oferta>>(`/api/ofertas/${id}`);
    return unwrapApiResponse(res.data);
  },
};