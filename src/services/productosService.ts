import { api, unwrapApiResponse, type ApiResult } from './api';

type Envelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

export type ProductoPropio = {
  producto_id: string;
  comercio_id: string;
  nombre: string;
  activo: boolean;
};

export const productosService = {
  mios: async (): Promise<ApiResult<ProductoPropio[]>> => {
    const res = await api.get<Envelope<ProductoPropio[]>>('/api/productos/mios');
    return unwrapApiResponse(res.data);
  },
};