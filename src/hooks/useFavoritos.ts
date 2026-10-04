import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { randomUUID } from 'expo-crypto';
import { useFavoritosStore } from '../store/favoritosStore';
import { pendingRepository } from '../db/pendingRepository';
import { favoritosRepository } from '../db/favoritosRepository';
import { useAuthStore } from '../store/authStore';
import { favoritosService } from '../services/favoritosService';

export function useFavoritos() {
  const favoritos = useFavoritosStore((s) => s.ids);
  const fallidos = useFavoritosStore((s) => s.fallidos);
  const esFavorito = useFavoritosStore((s) => s.esFavorito);
  const toggle = useFavoritosStore((s) => s.toggle);
  const usuario = useAuthStore((s) => s.usuario);
  const favoritosQuery = useQuery({
    queryKey: ['favoritos', usuario?.id],
    enabled: usuario?.rol === 'CONSUMIDOR',
    queryFn: async () => {
      const netState = await NetInfo.fetch();
      if (netState.isConnected && netState.isInternetReachable !== false) {
        try {
          const result = await favoritosService.listarIds();
          await favoritosRepository.reemplazar(result.data);
          return result.data;
        } catch {
          return favoritosRepository.obtenerIds();
        }
      }
      return favoritosRepository.obtenerIds();
    },
  });
  const fallidosQuery = useQuery({
    queryKey: ['favoritos-fallidos', usuario?.id],
    enabled: usuario?.rol === 'CONSUMIDOR',
    queryFn: async () => {
      const operaciones = await pendingRepository.obtenerFallidas();
      return operaciones.flatMap((op) => {
        try {
          const payload = JSON.parse(op.payload) as { comercio_id?: string };
          return payload.comercio_id ? [payload.comercio_id] : [];
        } catch {
          return [];
        }
      });
    },
  });

  useEffect(() => {
    if (favoritosQuery.data) {
      useFavoritosStore.getState().cargar(favoritosQuery.data);
    }
  }, [favoritosQuery.data]);

  useEffect(() => {
    if (fallidosQuery.data) {
      useFavoritosStore.getState().cargarFallidos(fallidosQuery.data);
    }
  }, [fallidosQuery.data]);

  const alternarFavorito = useCallback(
    async (comercioId: string) => {
      const estabaMarcado = esFavorito(comercioId);
      const tipoOperacion = estabaMarcado
        ? 'eliminar_favorito'
        : 'agregar_favorito';
      const operationId = randomUUID();
      useFavoritosStore.getState().limpiarFallo(comercioId);
      toggle(comercioId);

      try {
        if (estabaMarcado) {
          await favoritosRepository.eliminar(comercioId);
        } else {
          await favoritosRepository.agregar(comercioId);
        }

        const netState = await NetInfo.fetch();
        const tieneInternet =
          netState.isConnected && netState.isInternetReachable !== false;

        if (tieneInternet) {
          try {
            if (estabaMarcado) {
              await favoritosService.desmarcar(comercioId, operationId);
            } else {
              await favoritosService.marcar(comercioId, operationId);
            }
            return;
          } catch (error) {
            const apiError = error as { response?: { status?: number } };
            const status = apiError.response?.status;
            const estadoDeseadoYaExiste =
              (!estabaMarcado && status === 409) ||
              (estabaMarcado && status === 404);
            if (estadoDeseadoYaExiste) return;
            if (status && status >= 400 && status < 500) throw error;
          }
        }

        await pendingRepository.insertar({
          id: operationId,
          tipo_operacion: tipoOperacion,
          entidad: 'favorito',
          payload: JSON.stringify({
            comercio_id: comercioId,
            usuario_id: usuario?.id,
          }),
          creado_en: new Date().toISOString(),
        });
      } catch {
        toggle(comercioId);
        await Promise.allSettled([
          estabaMarcado
            ? favoritosRepository.agregar(comercioId)
            : favoritosRepository.eliminar(comercioId),
        ]);
      }
    },
    [esFavorito, toggle, usuario],
  );

  return {
    favoritos,
    fallidos,
    esFavorito,
    alternarFavorito,
    isLoading: favoritosQuery.isLoading,
  };
}