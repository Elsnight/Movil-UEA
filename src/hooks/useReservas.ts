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
    mutationFn: (data: { ofertaId: string; cantidad: number }) => reservasService.crear(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservas'] }),
  });
}