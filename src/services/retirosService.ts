import { api, unwrapApiResponse, type ApiResult } from './api';

type Envelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

export const retirosService = {
  validar: async (data: {
    codigo_retiro: string;
    metodo_validacion: 'QR' | 'CODIGO_MANUAL';
    observacion?: string;
  }): Promise<ApiResult<unknown>> => {
    const res = await api.post<Envelope<unknown>>('/api/retiros/validar', data);
    return unwrapApiResponse(res.data);
  },
};