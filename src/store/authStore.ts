import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { reiniciarDb } from '../db/database';
import { queryClient } from '../lib/queryClient';
import {
  ApiError,
  REFRESH_TOKEN_KEY,
  TOKEN_KEY,
  setSessionExpiredHandler,
} from '../services/api';
import { authService } from '../services/authService';
import {
  detenerSyncAutomatico,
  iniciarSyncAutomatico,
} from '../services/syncService';
import { useFavoritosStore } from './favoritosStore';

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
  setSesion: (
    token: string,
    refreshToken: string,
    usuario: Usuario,
  ) => Promise<void>;
  cerrarSesion: (notificarBackend?: boolean) => Promise<void>;
  cargarSesion: () => Promise<void>;
};

async function borrarSesionLocal(): Promise<void> {
  detenerSyncAutomatico();
  queryClient.clear();
  const resultados = await Promise.allSettled([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USUARIO_KEY),
    reiniciarDb(),
  ]);
  useFavoritosStore.getState().limpiar();

  if (resultados.some((resultado) => resultado.status === 'rejected')) {
    console.warn('No se pudieron borrar todos los datos locales de la sesión.');
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  usuario: null,
  token: null,
  refreshToken: null,
  isLoading: true,

  setSesion: async (token, refreshToken, usuario) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario)),
    ]);
    set({ token, refreshToken, usuario, isLoading: false });
    iniciarSyncAutomatico();
  },

  cerrarSesion: async (notificarBackend = true) => {
    const refreshToken = get().refreshToken;
    if (notificarBackend && refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        console.warn('No se pudo notificar el cierre de sesión al servidor.');
      }
    }

    await borrarSesionLocal();
    set({ token: null, refreshToken: null, usuario: null, isLoading: false });
  },

  cargarSesion: async () => {
    try {
      const [token, refreshToken, usuarioJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(USUARIO_KEY),
      ]);

      if (!refreshToken || !usuarioJson) {
        await borrarSesionLocal();
        set({ token: null, refreshToken: null, usuario: null, isLoading: false });
        return;
      }

      const usuario = JSON.parse(usuarioJson) as Usuario;
      const netState = await NetInfo.fetch();
      const sinInternet =
        !netState.isConnected || netState.isInternetReachable === false;

      if (sinInternet) {
        set({ token, refreshToken, usuario, isLoading: false });
        return;
      }

      try {
        const { data } = await authService.refresh(refreshToken);
        await Promise.all([
          SecureStore.setItemAsync(TOKEN_KEY, data.accessToken),
          SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken),
        ]);
        set({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          usuario,
          isLoading: false,
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await get().cerrarSesion(false);
          return;
        }
        console.warn('No se pudo renovar la sesión al iniciar la aplicación.');
        set({ token, refreshToken, usuario, isLoading: false });
      }
    } catch {
      await borrarSesionLocal();
      set({ token: null, refreshToken: null, usuario: null, isLoading: false });
    }
  },
}));

setSessionExpiredHandler(() => useAuthStore.getState().cerrarSesion(false));
