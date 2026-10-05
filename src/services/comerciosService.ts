import { api, unwrapApiResponse, type ApiResult } from './api';

type Envelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

export type Sucursal = {
  sucursal_id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string | null;
};

export type ComercioMio = {
  comercio_id: string;
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  estado_comercio: string;
  sucursales: Sucursal[];
};

export const comerciosService = {
  mios: async (): Promise<ApiResult<ComercioMio[]>> => {
    const res = await api.get<Envelope<ComercioMio[]>>('/api/comercios/mios');
    return unwrapApiResponse(res.data);
  },
};