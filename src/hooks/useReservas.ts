import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservasService } from '../services/reservasService';

export function useReservas() {
  return useQuery({
    queryKey: ['reservas'],
    queryFn: () => reservasService.listar(),
  });
}

export function useCrearReserva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reservasService.crear,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservas'] }),
  });
}

export function useCancelarReserva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reservasService.cancelar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservas'] }),
  });
}

export function useValidarRetiro() {
  return useMutation({
    mutationFn: reservasService.validarRetiro,
  });
}

export function useConfirmarRetiro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reservasService.confirmarRetiro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['ofertas'] });
    },
  });
}