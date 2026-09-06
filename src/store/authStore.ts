import { create } from 'zustand';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import { reiniciarDb } from '../db/database';

const USUARIO_KEY = 'usuario';

export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  rol: 'CONSUMIDOR' | 'COMERCIANTE' | 'ADMINISTRADOR';
};

type AuthStore = {
  usuario: Usuario | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  setSesion: (token: string, refreshToken: string, usuario: Usuario) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  cargarSesion: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  usuario: null,
  token: null,
  refreshToken: null,
  isLoading: true,

  setSesion: async (token, refreshToken, usuario) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario));
    set({ token, refreshToken, usuario, isLoading: false });
  },

  cerrarSesion: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USUARIO_KEY);
    await reiniciarDb();
    set({ token: null, refreshToken: null, usuario: null, isLoading: false });
  },

  cargarSesion: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const usuarioJson = await SecureStore.getItemAsync(USUARIO_KEY);
      if (!token || !usuarioJson) {
        set({ isLoading: false });
        return;
      }
      const usuario = JSON.parse(usuarioJson) as Usuario;
      set({ token, refreshToken, usuario, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USUARIO_KEY);
      set({ token: null, refreshToken: null, usuario: null, isLoading: false });
    }
  },
}));