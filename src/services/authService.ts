import { api } from './api';

type LoginInput = { email: string; password: string };
type RegistroInput = { email: string; password: string; nombre: string; rol: 'CONSUMIDOR' | 'COMERCIANTE' };
type AuthResponse = { token: string; usuario: { id: string; email: string; nombre: string; rol: string } };

export const authService = {
  login: (data: LoginInput) => api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),
  registro: (data: RegistroInput) => api.post<AuthResponse>('/api/auth/registro', data).then((r) => r.data),
  perfil: () => api.get<AuthResponse['usuario']>('/api/auth/perfil').then((r) => r.data),
};