import { create } from 'zustand';

type FavoritosStore = {
  ids: Record<string, boolean>;
  fallidos: Record<string, boolean>;
  toggle: (comercioId: string) => void;
  esFavorito: (comercioId: string) => boolean;
  cargar: (ids: string[]) => void;
  cargarFallidos: (ids: string[]) => void;
  agregar: (comercioId: string) => void;
  eliminar: (comercioId: string) => void;
  marcarFallido: (comercioId: string) => void;
  limpiarFallo: (comercioId: string) => void;
  limpiar: () => void;
};

export const useFavoritosStore = create<FavoritosStore>((set, get) => ({
  ids: {},
  fallidos: {},

  toggle: (comercioId) => {
    set((s) => ({
      ids: { ...s.ids, [comercioId]: !s.ids[comercioId] },
    }));
  },

  esFavorito: (comercioId) => !!get().ids[comercioId],

  cargar: (ids) =>
    set({
      ids: ids.reduce<Record<string, boolean>>((acc, id) => {
        acc[id] = true;
        return acc;
      }, {}),
    }),

  cargarFallidos: (ids) =>
    set({
      fallidos: ids.reduce<Record<string, boolean>>((acc, id) => {
        acc[id] = true;
        return acc;
      }, {}),
    }),

  agregar: (comercioId) =>
    set((s) => ({ ids: { ...s.ids, [comercioId]: true } })),

  eliminar: (comercioId) => {
    set((s) => {
      const next = { ...s.ids };
      delete next[comercioId];
      return { ids: next };
    });
  },

  marcarFallido: (comercioId) =>
    set((s) => ({ fallidos: { ...s.fallidos, [comercioId]: true } })),

  limpiarFallo: (comercioId) => {
    set((s) => {
      const next = { ...s.fallidos };
      delete next[comercioId];
      return { fallidos: next };
    });
  },

  limpiar: () => set({ ids: {}, fallidos: {} }),
}));
