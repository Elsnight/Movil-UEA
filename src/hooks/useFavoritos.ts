import { useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useFavoritosStore } from '../store/favoritosStore';
import { pendingRepository } from '../db/pendingRepository';
import { useAuthStore } from '../store/authStore';

let counter = 0;

function generarUUID() {
  counter++;
  return `${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useFavoritos() {
  const favoritos = useFavoritosStore((s) => s.ids);
  const esFavorito = useFavoritosStore((s) => s.esFavorito);
  const toggle = useFavoritosStore((s) => s.toggle);
  const usuario = useAuthStore((s) => s.usuario);

  const alternarFavorito = useCallback(
    async (ofertaId: string) => {
      const antes = esFavorito(ofertaId);
      toggle(ofertaId);

      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        const uuid = generarUUID();
        await pendingRepository.insertar({
          id: uuid,
          tipo_operacion: antes ? 'eliminar_favorito' : 'agregar_favorito',
          entidad: 'favorito',
          payload: JSON.stringify({
            oferta_id: ofertaId,
            usuario_id: usuario?.id,
          }),
          creado_en: new Date().toISOString(),
        });
      }
    },
    [esFavorito, toggle, usuario],
  );

  return { favoritos, esFavorito, alternarFavorito };
}