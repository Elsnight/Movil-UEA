import NetInfo from '@react-native-community/netinfo';
import { api } from './api';
import { pendingRepository } from '../db/pendingRepository';
import { useFavoritosStore } from '../store/favoritosStore';
import type { PendingOperation } from '../db/schema';

const MAX_INTENTOS = 5;

function esperarBackoff(intentos: number): Promise<void> {
  const ms = Math.min(Math.pow(2, intentos) * 1000, 60000);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ManejadorOperacion = (op: PendingOperation) => Promise<boolean>;

const manejadores: Record<string, ManejadorOperacion> = {
  agregar_favorito: async (op) => {
    const payload = JSON.parse(op.payload);
    await api.post(
      '/api/favoritos',
      { oferta_id: payload.oferta_id },
      { headers: { 'Idempotency-Key': op.id } },
    );
    useFavoritosStore.getState().cargar([payload.oferta_id]);
    return true;
  },
  eliminar_favorito: async (op) => {
    const payload = JSON.parse(op.payload);
    await api.delete(`/api/favoritos/${payload.oferta_id}`, {
      headers: { 'Idempotency-Key': op.id },
    });
    useFavoritosStore.getState().eliminar(payload.oferta_id);
    return true;
  },
};

async function procesarOperacion(op: PendingOperation): Promise<void> {
  const manejador = manejadores[op.tipo_operacion];
  if (!manejador) {
    await pendingRepository.marcarFallido(op.id);
    return;
  }

  await pendingRepository.marcarEnviando(op.id);

  try {
    const exito = await manejador(op);
    if (exito) {
      await pendingRepository.eliminar(op.id);
    }
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;

    if (status === 409) {
      await pendingRepository.eliminar(op.id);
      return;
    }

    if (status && status >= 400 && status < 500 && status !== 409) {
      await pendingRepository.marcarFallido(op.id);
      return;
    }

    await pendingRepository.incrementarIntentos(op.id);
    const opActualizada = (await pendingRepository.obtenerPendientes()).find(
      (p) => p.id === op.id,
    );
    if (opActualizada && opActualizada.intentos >= MAX_INTENTOS) {
      await pendingRepository.marcarFallido(op.id);
    }
  }
}

export async function procesarCola(): Promise<void> {
  const pendientes = await pendingRepository.obtenerPendientes();

  for (const op of pendientes) {
    await procesarOperacion(op);
    await esperarBackoff(op.intentos);
  }
}

let desuscribirNetInfo: (() => void) | null = null;

export function iniciarSyncAutomatico(): void {
  if (desuscribirNetInfo) return;

  desuscribirNetInfo = NetInfo.addEventListener((estado) => {
    if (estado.isConnected) {
      procesarCola();
    }
  });
}

export function detenerSyncAutomatico(): void {
  desuscribirNetInfo?.();
  desuscribirNetInfo = null;
}