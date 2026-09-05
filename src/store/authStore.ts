import { create } from 'zustand';
import { TOKEN_KEY } from '../services/api';
import * as SecureStore from 'expo-secure-store';

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
  isLoading: boolean;
  setSesion: (token: string, usuario: Usuario) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  cargarSesion: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  usuario: null,
  token: null,
  isLoading: true,

  setSesion: async (token, usuario) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario));
    set({ token, usuario, isLoading: false });
  },

  cerrarSesion: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USUARIO_KEY);
    set({ token: null, usuario: null, isLoading: false });
  },

  cargarSesion: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const usuarioJson = await SecureStore.getItemAsync(USUARIO_KEY);
      if (!token || !usuarioJson) {
        set({ isLoading: false });
        return;
      }
      const usuario = JSON.parse(usuarioJson) as Usuario;
      set({ token, usuario, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USUARIO_KEY);
      set({ token: null, usuario: null, isLoading: false });
    }
  },
}));