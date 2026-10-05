import { api, unwrapApiResponse, type ApiResult } from './api';

type Envelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

export type ProductoPropio = {
  producto_id: string;
  comercio_id: string;
  nombre: string;
  activo: boolean;
};

export type Categoria = {
  categoria_id: number;
  nombre: string;
};

export const productosService = {
  mios: async (): Promise<ApiResult<ProductoPropio[]>> => {
    const res = await api.get<Envelope<ProductoPropio[]>>('/api/productos/mios');
    return unwrapApiResponse(res.data);
  },
  crear: async (data: {
    comercio_id: string;
    categoria_id: number;
    nombre: string;
    descripcion?: string;
    informacion_alergenos?: string;
    imagen_url?: string;
    activo?: boolean;
  }): Promise<ApiResult<{ producto_id: string }>> => {
    const res = await api.post<Envelope<{ producto_id: string }>>('/api/productos', data);
    return unwrapApiResponse(res.data);
  },
  categorias: async (): Promise<ApiResult<Categoria[]>> => {
    const res = await api.get<Envelope<Categoria[]>>('/api/categorias');
    return unwrapApiResponse(res.data);
  },
};