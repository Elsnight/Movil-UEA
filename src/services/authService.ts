import { api } from './api';

type LoginInput = { email: string; password: string };
type RegistroInput = { email: string; password: string; nombre: string; rol: 'CONSUMIDOR' | 'COMERCIANTE' };

type RailwayEnvelope<T> = { success: boolean; data: T };

type RailwayLoginData = {
  accessToken: string;
  refreshToken: string;
  usuario: { usuario_id: string; nombres: string; correo: string; rol: string };
};

function mapUsuario(u: { usuario_id: string; nombres: string; correo: string; rol: string }) {
  return { id: u.usuario_id, email: u.correo, nombre: u.nombres, rol: u.rol as 'CONSUMIDOR' | 'COMERCIANTE' | 'ADMINISTRADOR' };
}

export const authService = {
  login: async (data: LoginInput) => {
    const res = await api.post<RailwayEnvelope<RailwayLoginData>>('/api/auth/login', {
      correo: data.email,
      contrasena: data.password,
    });
    const d = res.data.data;
    return { token: d.accessToken, usuario: mapUsuario(d.usuario) };
  },

  registro: async (data: RegistroInput) => {
    const res = await api.post<RailwayEnvelope<RailwayLoginData>>('/api/auth/registro', {
      correo: data.email,
      contrasena: data.password,
      nombres: data.nombre,
      apellidos: '',
      rol_nombre: data.rol,
    });
    const d = res.data.data;
    return { token: d.accessToken, usuario: mapUsuario(d.usuario) };
  },
};