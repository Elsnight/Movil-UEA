import {
  api,
  unwrapApiResponse,
  type ApiMeta,
  type ApiResult,
} from './api';
import type { Usuario } from '../store/authStore';

type LoginInput = { email: string; password: string };

export type RegistroInput = {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  rol: 'CONSUMIDOR' | 'COMERCIANTE';
};

type AuthDataDto = {
  accessToken: string;
  refreshToken: string;
  usuario: {
    usuario_id: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: Usuario['rol'];
  };
};

type RefreshData = { accessToken: string; refreshToken: string };
type Envelope<T> = { success: boolean; data: T; meta?: ApiMeta };
type SessionData = {
  token: string;
  refreshToken: string;
  usuario: Usuario;
};

function mapSession(data: AuthDataDto): SessionData {
  return {
    token: data.accessToken,
    refreshToken: data.refreshToken,
    usuario: {
      id: data.usuario.usuario_id,
      email: data.usuario.correo,
      nombre: `${data.usuario.nombres} ${data.usuario.apellidos}`.trim(),
      rol: data.usuario.rol,
    },
  };
}

export const authService = {
  login: async (data: LoginInput): Promise<ApiResult<SessionData>> => {
    const response = await api.post<Envelope<AuthDataDto>>('/api/auth/login', {
      correo: data.email,
      contrasena: data.password,
    });
    const result = unwrapApiResponse(response.data);
    return { data: mapSession(result.data), meta: result.meta };
  },

  registro: async (data: RegistroInput): Promise<ApiResult<SessionData>> => {
    const response = await api.post<Envelope<AuthDataDto>>('/api/auth/registro', {
      correo: data.email,
      contrasena: data.password,
      nombres: data.nombres.trim(),
      apellidos: data.apellidos.trim(),
      rol_nombre: data.rol,
    });
    const result = unwrapApiResponse(response.data);
    return { data: mapSession(result.data), meta: result.meta };
  },

  refresh: async (refreshToken: string): Promise<ApiResult<RefreshData>> => {
    const response = await api.post<Envelope<RefreshData>>('/api/auth/refresh', {
      refreshToken,
    });
    return unwrapApiResponse(response.data);
  },

  logout: async (
    refreshToken: string,
  ): Promise<ApiResult<{ message: string }>> => {
    const response = await api.post<Envelope<{ message: string }>>(
      '/api/auth/logout',
      { refreshToken },
    );
    return unwrapApiResponse(response.data);
  },
};
