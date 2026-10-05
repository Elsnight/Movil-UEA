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
  crear: async (data: {
    ruc: string;
    razon_social: string;
    nombre_comercial: string;
    correo_contacto: string;
  }): Promise<ApiResult<{ comercio_id: string; estado_comercio: string }>> => {
    const res = await api.post<Envelope<{ comercio_id: string; estado_comercio: string }>>('/api/comercios', data);
    return unwrapApiResponse(res.data);
  },
  agregarSucursal: async (comercioId: string, data: {
    nombre: string;
    direccion: string;
    ciudad: string;
    latitud: number;
    longitud: number;
    telefono?: string;
  }): Promise<ApiResult<{ sucursal_id: string }>> => {
    const res = await api.post<Envelope<{ sucursal_id: string }>>(`/api/comercios/${comercioId}/sucursales`, data);
    return unwrapApiResponse(res.data);
  },
};