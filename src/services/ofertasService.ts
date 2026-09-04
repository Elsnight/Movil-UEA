import { api } from './api';

export type Oferta = {
  id: string;
  titulo: string;
  descripcion: string;
  precioOriginal: number;
  precioOferta: number;
  cantidadDisponible: number;
  unidad: string;
  estado: 'DISPONIBLE' | 'PAUSADA' | 'AGOTADA' | 'EXPIRADA';
  fechaVencimiento: string;
  imagenUrl?: string;
  comercio: { id: string; nombre: string; direccion: string; latitud: number; longitud: number };
  createdAt: string;
};

type PaginatedResponse<T> = { data: T[]; total: number; page: number; limit: number };

export const ofertasService = {
  listar: (params?: { page?: number; limit?: number; latitud?: number; longitud?: number; radio?: number }) =>
    api.get<PaginatedResponse<Oferta>>('/api/ofertas', { params }).then((r) => r.data),
  obtenerPorId: (id: string) => api.get<Oferta>(`/api/ofertas/${id}`).then((r) => r.data),
  crear: (data: Omit<Oferta, 'id' | 'estado' | 'createdAt' | 'comercio'>) =>
    api.post<Oferta>('/api/ofertas', data).then((r) => r.data),
  actualizar: (id: string, data: Partial<Oferta>) =>
    api.patch<Oferta>(`/api/ofertas/${id}`, data).then((r) => r.data),
  misOfertas: () => api.get<Oferta[]>('/api/ofertas/mias').then((r) => r.data),
};