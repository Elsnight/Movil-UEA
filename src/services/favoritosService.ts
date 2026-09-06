import { api } from './api';

type FavoritoApi = {
  comercio_id?: string;
  comercioId?: string;
  comercio?: { id?: string };
};

type RailwayEnvelope<T> = { success: boolean; data: T };

function extraerLista(respuesta: unknown): FavoritoApi[] {
  if (Array.isArray(respuesta)) return respuesta as FavoritoApi[];
  if (respuesta && typeof respuesta === 'object') {
    const data = (respuesta as { data?: unknown }).data;
    if (Array.isArray(data)) return data as FavoritoApi[];
  }
  return [];
}

function obtenerComercioId(favorito: FavoritoApi): string | null {
  return (
    favorito.comercio_id ?? favorito.comercioId ?? favorito.comercio?.id ?? null
  );
}

export const favoritosService = {
  listarIds: async (): Promise<string[]> => {
    const res = await api.get<RailwayEnvelope<unknown>>('/api/favoritos');
    return extraerLista(res.data.data)
      .map(obtenerComercioId)
      .filter((id): id is string => id !== null);
  },

  marcar: async (comercioId: string, idempotencyKey: string): Promise<void> => {
    await api.post(
      '/api/favoritos',
      { comercio_id: comercioId },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    );
  },

  desmarcar: async (
    comercioId: string,
    idempotencyKey: string,
  ): Promise<void> => {
    await api.delete(`/api/favoritos/${comercioId}`, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
  },
};
