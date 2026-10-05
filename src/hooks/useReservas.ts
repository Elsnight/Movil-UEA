import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservasService, type CrearReservaInput } from '../services/reservasService';
import { useAuthStore } from '../store/authStore';

export function useReservas() {
  const usuarioId = useAuthStore.getState().usuario?.id;
  return useQuery({
    queryKey: ['reservas', usuarioId],
    queryFn: () => reservasService.listar().then((r) => r.data),
  });
}

export function useCrearReserva() {
  const queryClient = useQueryClient();
  const usuarioId = useAuthStore.getState().usuario?.id;
  return useMutation({
    mutationFn: (data: CrearReservaInput) => reservasService.crear(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas', usuarioId] });
    },
  });
}