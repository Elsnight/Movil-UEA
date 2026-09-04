import { api } from './api';

export type Reserva = {
  id: string;
  usuarioId: string;
  ofertaId: string;
  cantidad: number;
  codigoRetiro: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'RETIRADA' | 'VENCIDA';
  createdAt: string;
  oferta: {
    id: string;
    titulo: string;
    precioOferta: number;
    imagenUrl?: string;
    comercio: { id: string; nombre: string; direccion: string };
  };
};

type ValidarRetiroInput = { codigoRetiro: string };
type ValidarRetiroResponse = { valido: boolean; reserva?: Reserva; mensaje: string };

export const reservasService = {
  listar: () => api.get<Reserva[]>('/api/reservas').then((r) => r.data),
  crear: (data: { ofertaId: string; cantidad: number }) =>
    api.post<Reserva>('/api/reservas', data).then((r) => r.data),
  cancelar: (id: string) => api.patch<Reserva>(`/api/reservas/${id}/cancelar`).then((r) => r.data),
  validarRetiro: (data: ValidarRetiroInput) =>
    api.post<ValidarRetiroResponse>('/api/retiros/validar', data).then((r) => r.data),
  confirmarRetiro: (codigoRetiro: string) =>
    api.post<Reserva>(`/api/retiros/${codigoRetiro}/confirmar`).then((r) => r.data),
};