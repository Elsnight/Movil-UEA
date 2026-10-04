import { useInfiniteQuery, useQuery, type QueryKey } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { ofertasService, type Oferta } from '../services/ofertasService';
import { ApiError } from '../services/api';
import { ofertasRepository } from '../db/ofertasRepository';
import type { OfertaCacheada } from '../db/schema';

type UseOfertasParams = {
  page?: number;
  limit?: number;
  latitud?: number;
  longitud?: number;
  radio?: number;
};

type UseOfertasResult = {
  data: Oferta[] | undefined;
  meta: { pagina: number; limite: number; total: number; total_paginas: number } | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isFromCache: boolean;
  cacheAgeMinutos: number | null;
  errorMessage: string;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

type OfertasQueryData = {
  ofertas: Oferta[];
  meta: { pagina: number; limite: number; total: number; total_paginas: number };
  isFromCache: boolean;
  cacheAgeMinutos: number | null;
};

type InfinitePages = { pages: OfertasQueryData[] };

const LIMITE = 20;
const ERROR_SIN_CONEXION =
  'No hay conexión y todavía no hay ofertas guardadas. Conéctate a internet y vuelve a intentar.';
const ERROR_CARGA =
  'No pudimos cargar las ofertas desde el servidor. Inténtalo nuevamente en unos minutos.';

export function useOfertas(params?: UseOfertasParams): UseOfertasResult {
  const query = useInfiniteQuery({
    queryKey: ['ofertas', 'infinite', params] as QueryKey,
    queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
      const netState = await NetInfo.fetch();

      if (netState.isConnected && netState.isInternetReachable !== false) {
        try {
          const result = await ofertasService.listar({
            ...(params as Record<string, string | number | undefined>),
            pagina: pageParam,
            limite: LIMITE,
          });
          await ofertasRepository.guardarOfertas(result.data);
          return {
            ofertas: result.data,
            meta: (result.meta as { pagina: number; limite: number; total: number; total_paginas: number }) ?? { pagina: pageParam, limite: LIMITE, total: 0, total_paginas: 0 },
            isFromCache: false,
            cacheAgeMinutos: null,
          };
        } catch (error) {
          if (pageParam === 1) {
            const cache = await obtenerCache();
            if (cache) return cache;
          }
          throw error;
        }
      }

      if (pageParam === 1) {
        const cache = await obtenerCache();
        if (cache) return cache;
      }
      throw new Error(ERROR_SIN_CONEXION);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const qd = lastPage as unknown as OfertasQueryData;
      const totalPaginas = qd.meta?.total_paginas ?? 0;
      const nextPage = (lastPageParam as number) + 1;
      return nextPage <= totalPaginas ? nextPage : undefined;
    },
    retry: false,
  });

  const result = (query.data as unknown as InfinitePages | undefined)?.pages;
  const allData = result ? result.flatMap((page) => page.ofertas) : undefined;
  const lastPage = result ? result[result.length - 1] : undefined;

  return {
    data: allData,
    meta: lastPage?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
    isFromCache: result?.[0]?.isFromCache ?? false,
    cacheAgeMinutos: result?.[0]?.cacheAgeMinutos ?? null,
    errorMessage:
      query.error instanceof Error && query.error.message === ERROR_SIN_CONEXION
        ? ERROR_SIN_CONEXION
        : query.error instanceof ApiError
          ? query.error.message
          : ERROR_CARGA,
    fetchNextPage: () => void query.fetchNextPage(),
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

export function useOfertaPorId(id: string) {
  return useQuery({
    queryKey: ['oferta', id],
    queryFn: () => ofertasService.obtenerPorId(id).then((r) => r.data),
    enabled: !!id,
  });
}

function calcularMinutosDesde(iso: string): number {
  const fecha = iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`;
  const diff = Date.now() - new Date(fecha).getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

async function obtenerCache(): Promise<OfertasQueryData | null> {
  const [cache, syncedAt] = await Promise.all([
    ofertasRepository.obtenerOfertasCacheadas(),
    ofertasRepository.obtenerAntiguedadCache(),
  ]);

  if (cache.length === 0) return null;

  return {
    ofertas: cache.map(mapaCacheAOferta),
    meta: { pagina: 1, limite: cache.length, total: cache.length, total_paginas: 1 },
    isFromCache: true,
    cacheAgeMinutos: syncedAt ? calcularMinutosDesde(syncedAt) : 0,
  };
}

function mapaCacheAOferta(c: OfertaCacheada): Oferta {
  return {
    id: c.oferta_id,
    titulo: c.titulo_publico,
    descripcion: c.descripcion,
    precioOriginal: c.precio_original,
    precioOferta: c.precio_oferta,
    cantidadDisponible: c.cantidad_disponible,
    sucursal: { id: c.sucursal_id },
    unidad: c.unidad,
    estado: c.estado_oferta,
    fechaVencimiento: c.fecha_vencimiento,
    imagenUrl: c.imagen_url ?? undefined,
    comercio: {
      id: c.comercio_id,
      nombre: c.comercio_nombre,
      direccion: c.comercio_direccion,
      latitud: c.comercio_latitud,
      longitud: c.comercio_longitud,
    },
    createdAt: c.created_at,
  };
}