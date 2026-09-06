import { useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { ofertasService, type Oferta } from '../services/ofertasService';
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
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isFromCache: boolean;
  cacheAgeMinutos: number | null;
  errorMessage: string;
};

type OfertasQueryData = {
  ofertas: Oferta[];
  isFromCache: boolean;
  cacheAgeMinutos: number | null;
};

const ERROR_SIN_CONEXION =
  'No hay conexión y todavía no hay ofertas guardadas. Conéctate a internet y vuelve a intentar.';
const ERROR_CARGA =
  'No pudimos cargar las ofertas desde el servidor. Inténtalo nuevamente en unos minutos.';

export function useOfertas(params?: UseOfertasParams): UseOfertasResult {
  const query = useQuery<OfertasQueryData>({
    queryKey: ['ofertas', 'offline-v2', params],
    queryFn: async () => {
      const netState = await NetInfo.fetch();

      if (netState.isConnected && netState.isInternetReachable !== false) {
        try {
          const ofertas = await ofertasService.listar(
            params as Record<string, string | number | undefined>,
          );
          await ofertasRepository.guardarOfertas(ofertas);
          return { ofertas, isFromCache: false, cacheAgeMinutos: null };
        } catch (error) {
          const cache = await obtenerCache();
          if (cache) return cache;
          throw error;
        }
      }

      const cache = await obtenerCache();
      if (cache) return cache;
      throw new Error(ERROR_SIN_CONEXION);
    },
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  return {
    data: query.data?.ofertas,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
    isFromCache: query.data?.isFromCache ?? false,
    cacheAgeMinutos: query.data?.cacheAgeMinutos ?? null,
    errorMessage:
      query.error instanceof Error && query.error.message === ERROR_SIN_CONEXION
        ? ERROR_SIN_CONEXION
        : ERROR_CARGA,
  };
}

export function useOfertaPorId(id: string) {
  return useQuery({
    queryKey: ['oferta', id],
    queryFn: () => ofertasService.obtenerPorId(id),
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
