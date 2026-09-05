import { create } from 'zustand';
import { TOKEN_KEY } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';

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
    set({ token, usuario, isLoading: false });
  },

  cerrarSesion: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, usuario: null, isLoading: false });
  },

  cargarSesion: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const usuario = await authService.perfil() as Usuario;
      set({ token, usuario, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ token: null, usuario: null, isLoading: false });
    }
  },
}));