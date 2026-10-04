import { api, unwrapApiResponse, type ApiResult } from './api';

type Envelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

export type ComercioPendiente = {
  comercio_id: string;
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  correo_contacto: string;
  estado_comercio: string;
  fecha_registro: string;
  propietario: {
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string | null;
  };
};

export const adminService = {
  listarPendientes: async (): Promise<ApiResult<ComercioPendiente[]>> => {
    const res = await api.get<Envelope<ComercioPendiente[]>>('/api/admin/comercios/pendientes');
    return unwrapApiResponse(res.data);
  },

  cambiarEstado: async (comercioId: string, estado: 'ACTIVO' | 'SUSPENDIDO'): Promise<void> => {
    await api.patch(`/api/admin/comercios/${comercioId}/estado`, {
      estado_comercio: estado,
    });
  },
};