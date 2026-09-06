import NetInfo from '@react-native-community/netinfo';
import { favoritosService } from './favoritosService';
import { pendingRepository } from '../db/pendingRepository';
import { favoritosRepository } from '../db/favoritosRepository';
import { useFavoritosStore } from '../store/favoritosStore';
import type { PendingOperation } from '../db/schema';

const MAX_INTENTOS = 5;

function esperarBackoff(intentos: number): Promise<void> {
  const ms = Math.min(Math.pow(2, intentos) * 1000, 60000);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type FavoritoPayload = { comercio_id: string };
type ManejadorOperacion = (op: PendingOperation) => Promise<void>;

function obtenerPayloadFavorito(op: PendingOperation): FavoritoPayload {
  const payload = JSON.parse(op.payload) as Partial<FavoritoPayload>;
  if (!payload.comercio_id)
    throw new Error('Operación de favorito sin comercio_id');
  return { comercio_id: payload.comercio_id };
}

const manejadores: Record<string, ManejadorOperacion> = {
  agregar_favorito: async (op) => {
    const payload = obtenerPayloadFavorito(op);
    await favoritosService.marcar(payload.comercio_id, op.id);
    await favoritosRepository.agregar(payload.comercio_id);
    useFavoritosStore.getState().agregar(payload.comercio_id);
    useFavoritosStore.getState().limpiarFallo(payload.comercio_id);
  },
  eliminar_favorito: async (op) => {
    const payload = obtenerPayloadFavorito(op);
    await favoritosService.desmarcar(payload.comercio_id, op.id);
    await favoritosRepository.eliminar(payload.comercio_id);
    useFavoritosStore.getState().eliminar(payload.comercio_id);
    useFavoritosStore.getState().limpiarFallo(payload.comercio_id);
  },
};

type ResultadoOperacion = 'confirmada' | 'reintentar' | 'fallida';

async function procesarOperacion(
  op: PendingOperation,
): Promise<ResultadoOperacion> {
  const manejador = manejadores[op.tipo_operacion];
  if (!manejador) {
    await pendingRepository.marcarFallido(op.id);
    return 'fallida';
  }

  await pendingRepository.marcarEnviando(op.id);

  try {
    await manejador(op);
    await pendingRepository.eliminar(op.id);
    return 'confirmada';
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    const estadoDeseadoYaExiste =
      (op.tipo_operacion === 'agregar_favorito' && status === 409) ||
      (op.tipo_operacion === 'eliminar_favorito' && status === 404);

    if (estadoDeseadoYaExiste) {
      await pendingRepository.eliminar(op.id);
      return 'confirmada';
    }

    if (status && status >= 400 && status < 500) {
      await pendingRepository.marcarFallido(op.id);
      if (op.entidad === 'favorito') {
        useFavoritosStore
          .getState()
          .marcarFallido(obtenerPayloadFavorito(op).comercio_id);
      }
      return 'fallida';
    }

    const intentos = op.intentos + 1;
    await pendingRepository.incrementarIntentos(op.id);
    if (intentos >= MAX_INTENTOS) {
      await pendingRepository.marcarFallido(op.id);
      if (op.entidad === 'favorito') {
        useFavoritosStore
          .getState()
          .marcarFallido(obtenerPayloadFavorito(op).comercio_id);
      }
      return 'fallida';
    }
    return 'reintentar';
  }
}

let procesamiento: Promise<void> | null = null;

export async function procesarCola(): Promise<void> {
  if (procesamiento) return procesamiento;

  procesamiento = (async () => {
    const pendientes = await pendingRepository.obtenerPendientes();

    for (const pendiente of pendientes) {
      const op = { ...pendiente };
      let resultado = await procesarOperacion(op);

      while (resultado === 'reintentar') {
        await esperarBackoff(op.intentos + 1);
        const netState = await NetInfo.fetch();
        if (!netState.isConnected || netState.isInternetReachable === false)
          break;
        op.intentos += 1;
        resultado = await procesarOperacion(op);
      }
    }
  })();

  try {
    await procesamiento;
  } finally {
    procesamiento = null;
  }
}

let desuscribirNetInfo: (() => void) | null = null;

export function iniciarSyncAutomatico(): void {
  if (desuscribirNetInfo) return;

  desuscribirNetInfo = NetInfo.addEventListener((estado) => {
    if (estado.isConnected) {
      void procesarCola();
    }
  });
}

export function detenerSyncAutomatico(): void {
  desuscribirNetInfo?.();
  desuscribirNetInfo = null;
}
