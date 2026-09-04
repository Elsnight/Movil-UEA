import { useQuery } from '@tanstack/react-query';
import { ofertasService } from '../services/ofertasService';

type UseOfertasParams = { page?: number; limit?: number; latitud?: number; longitud?: number; radio?: number };

export function useOfertas(params?: UseOfertasParams) {
  return useQuery({
    queryKey: ['ofertas', params],
    queryFn: () => ofertasService.listar(params),
  });
}

export function useOfertaPorId(id: string) {
  return useQuery({
    queryKey: ['oferta', id],
    queryFn: () => ofertasService.obtenerPorId(id),
    enabled: !!id,
  });
}

export function useMisOfertas() {
  return useQuery({
    queryKey: ['mis-ofertas'],
    queryFn: () => ofertasService.misOfertas(),
  });
}