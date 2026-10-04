import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservasService, type CrearReservaInput } from '../services/reservasService';
import { useAuthStore } from '../store/authStore';

export function useReservas() {
  const usuario = useAuthStore((s) => s.usuario);
  return useQuery({
    queryKey: ['reservas', usuario?.id],
    queryFn: () => reservasService.listar().then((r) => r.data),
  });
}

export function useCrearReserva() {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((s) => s.usuario);
  return useMutation({
    mutationFn: (data: CrearReservaInput) => reservasService.crear(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas', usuario?.id] });
    },
  });
}