import { api, unwrapApiResponse, type ApiResult } from './api';

type Envelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

export const pagosService = {
  pagar: async (data: {
    reserva_id: string;
    metodo_pago: 'TARJETA' | 'TRANSFERENCIA' | 'BILLETERA';
  }): Promise<ApiResult<{ estado: string }>> => {
    const res = await api.post<Envelope<{ estado: string }>>('/api/pagos', data);
    return unwrapApiResponse(res.data);
  },
};