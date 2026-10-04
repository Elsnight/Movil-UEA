import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const baseURL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

export type ApiMeta = Record<string, unknown>;

export type ApiResult<T, TMeta extends ApiMeta = ApiMeta> = {
  data: T;
  meta: TMeta;
};

type ApiEnvelope<T, TMeta extends ApiMeta = ApiMeta> = {
  success: boolean;
  data: T;
  meta?: TMeta;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshData = {
  accessToken: string;
  refreshToken: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function unwrapApiResponse<T, TMeta extends ApiMeta = ApiMeta>(
  envelope: ApiEnvelope<T, TMeta>,
): ApiResult<T, TMeta> {
  if (!envelope || envelope.success !== true || !('data' in envelope)) {
    throw new ApiError(
      0,
      'INVALID_RESPONSE',
      'El servidor devolvió una respuesta inválida.',
    );
  }

  return { data: envelope.data, meta: envelope.meta ?? ({} as TMeta) };
}

function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const backendError = axiosError.response?.data?.error;

    if (backendError?.message) {
      return new ApiError(
        axiosError.response?.status ?? 0,
        backendError.code ?? 'API_ERROR',
        backendError.message,
        backendError.details,
      );
    }

    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      return new ApiError(
        0,
        'TIMEOUT',
        'La solicitud tardó demasiado. Inténtalo de nuevo.',
      );
    }

    if (!axiosError.response) {
      return new ApiError(
        0,
        'NETWORK_ERROR',
        'Sin conexión. Revisa tu conexión a internet.',
      );
    }

    return new ApiError(
      axiosError.response.status,
      'HTTP_ERROR',
      'No se pudo completar la solicitud.',
    );
  }

  return new ApiError(0, 'UNKNOWN_ERROR', 'Ocurrió un error inesperado.');
}

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<RefreshData> | null = null;
let sessionExpiredHandler: (() => Promise<void>) | null = null;

export function setSessionExpiredHandler(
  handler: () => Promise<void>,
): void {
  sessionExpiredHandler = handler;
}

async function refreshTokens(): Promise<RefreshData> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new ApiError(401, 'UNAUTHORIZED', 'La sesión ha expirado.');
    }

    const response = await axios.post<ApiEnvelope<RefreshData>>(
      `${baseURL}/api/auth/refresh`,
      { refreshToken },
      { timeout: 10000, headers: { 'Content-Type': 'application/json' } },
    );
    const result = unwrapApiResponse(response.data);
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, result.data.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, result.data.refreshToken),
    ]);
    return result.data;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as AxiosError;
    const config = axiosError.config as RetriableRequestConfig | undefined;
    const isAuthRequest = config?.url?.startsWith('/api/auth/') ?? false;

    if (
      axiosError.response?.status === 401 &&
      config &&
      !isAuthRequest &&
      !config._retry
    ) {
      config._retry = true;
      try {
        const tokens = await refreshTokens();
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return await api(config);
      } catch (refreshError) {
        await sessionExpiredHandler?.();
        return Promise.reject(normalizeApiError(refreshError));
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export { api, TOKEN_KEY, REFRESH_TOKEN_KEY };
