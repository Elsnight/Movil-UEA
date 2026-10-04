import { api, unwrapApiResponse, type ApiResult } from './api';

type Envelope<T> = { success: boolean; data: T; meta?: Record<string, unknown> };

export const favoritosService = {
  listarIds: async (): Promise<ApiResult<string[]>> => {
    const res = await api.get<Envelope<{ id: string }[]>>('/api/favoritos');
    const result = unwrapApiResponse(res.data);
    return { data: result.data.map((item) => item.id), meta: result.meta };
  },

  marcar: async (comercioId: string, idempotencyKey: string): Promise<void> => {
    await api.post(
      '/api/favoritos',
      { comercio_id: comercioId },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    );
  },

  desmarcar: async (comercioId: string, idempotencyKey: string): Promise<void> => {
    await api.delete(`/api/favoritos/${comercioId}`, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },
};