import { create } from 'zustand';

type FavoritosStore = {
  ids: Record<string, boolean>;
  toggle: (ofertaId: string) => void;
  esFavorito: (ofertaId: string) => boolean;
  cargar: (ids: string[]) => void;
  eliminar: (ofertaId: string) => void;
};

export const useFavoritosStore = create<FavoritosStore>((set, get) => ({
  ids: {},

  toggle: (ofertaId) => {
    set((s) => ({
      ids: { ...s.ids, [ofertaId]: !s.ids[ofertaId] },
    }));
  },

  esFavorito: (ofertaId) => !!get().ids[ofertaId],

  cargar: (ids) =>
    set({
      ids: ids.reduce<Record<string, boolean>>((acc, id) => {
        acc[id] = true;
        return acc;
      }, {}),
    }),

  eliminar: (ofertaId) => {
    set((s) => {
      const next = { ...s.ids };
      delete next[ofertaId];
      return { ids: next };
    });
  },
}));