import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { ofertasService, type Oferta } from '../services/ofertasService';
import { ofertasRepository } from '../db/ofertasRepository';

type UseOfertasParams = { page?: number; limit?: number; latitud?: number; longitud?: number; radio?: number };

type UseOfertasResult = {
  data: Oferta[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isFromCache: boolean;
  cacheAgeMinutos: number | null;
};

export function useOfertas(params?: UseOfertasParams): UseOfertasResult {
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheAgeMinutos, setCacheAgeMinutos] = useState<number | null>(null);

  const { data, isLoading, isError, refetch: _refetch } = useQuery({
    queryKey: ['ofertas', params],
    queryFn: async () => {
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        try {
          const ofertas = await ofertasService.listar(params as Record<string, string | number | undefined>);
          await ofertasRepository.guardarOfertas(ofertas);
          setIsFromCache(false);
          setCacheAgeMinutos(null);
          return ofertas;
        } catch {
          const [cache, edadStr] = await Promise.all([
            ofertasRepository.obtenerOfertasCacheadas(),
            ofertasRepository.obtenerAntiguedadCache(),
          ]);
          setIsFromCache(true);
          setCacheAgeMinutos(edadStr ? calcularMinutosDesde(edadStr) : null);
          return cache.length > 0 ? cache.map(mapaCacheAOferta) : [];
        }
      }
      const [cache, edadStr] = await Promise.all([
        ofertasRepository.obtenerOfertasCacheadas(),
        ofertasRepository.obtenerAntiguedadCache(),
      ]);
      setIsFromCache(true);
      setCacheAgeMinutos(edadStr ? calcularMinutosDesde(edadStr) : null);
      return cache.length > 0 ? cache.map(mapaCacheAOferta) : [];
    },
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  return {
    data,
    isLoading,
    isError: isError && !isFromCache,
    refetch: () => _refetch(),
    isFromCache,
    cacheAgeMinutos,
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
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

function mapaCacheAOferta(c: {
  oferta_id: string;
  titulo_publico: string;
  descripcion: string;
  precio_original: number;
  precio_oferta: number;
  cantidad_disponible: number;
  unidad: string;
  estado_oferta: string;
  fecha_vencimiento: string;
  imagen_url: string | null;
  comercio_id: string;
  comercio_nombre: string;
  comercio_direccion: string;
  comercio_latitud: number;
  comercio_longitud: number;
  created_at: string;
}): Oferta {
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