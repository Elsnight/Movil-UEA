# Clasificación de datos — RescateFresco

Este documento clasifica todos los datos que maneja la aplicación según su
sensibilidad y criticidad, y asigna a cada categoría su mecanismo de
almacenamiento concreto en el proyecto.

## Tabla de clasificación

| Dato | Categoría | Mecanismo | Justificación |
|------|-----------|-----------|---------------|
| `accessToken` (JWT) | Credencial de sesión | `expo-secure-store` (llave: `accessToken`) | Ya implementado en `src/services/api.ts:4` y `src/store/authStore.ts:29`. El token nunca sale del almacenamiento cifrado del dispositivo. |
| `refreshToken` (JWT) | Credencial de sesión | `expo-secure-store` (llave: `refreshToken`) | Se añade en esta iteración. Se guarda junto al `accessToken` para permitir renovación automática de sesión sin pedir credenciales de nuevo. |
| `Usuario` (`{ id, email, nombre, rol }`) | Identidad del usuario en sesión | `expo-secure-store` (llave: `usuario`, serializado como JSON) | Ya implementado en `authStore.ts:30`. Se guarda cifrado porque contiene el `email` (PII). No se migra a SQLite porque se consulta únicamente en el arranque de la app y en cambios de sesión — no justifica descifrado recurrente. |
| `Oferta` (`{ id, titulo, precioOriginal, precioOferta, ... }`) | Catálogo cacheados para lectura offline | SQLite (`expo-sqlite`), tabla `oferta_cache` | Datos públicos (no sensibles). Se cachean para permitir exploración sin conexión. La columna `synced_at` permite al UI indicar antigüedad de la caché. |
| `Reserva` (`{ id, usuarioId, ofertaId, cantidad, estado, ... }`) | Datos de usuario (consulta) | Solo se consulta vía API (`GET /api/reservas/mias`). No se cachea offline porque el estado cambia en tiempo real (PENDIENTE_PAGO → LISTA_RETIRO, etc.) y mostrar un estado desactualizado podría llevar al usuario a presentarse a retirar cuando la reserva ya expiró. | No almacenado localmente. |
| Operaciones pendientes de sincronizar (favoritos marcados offline, etc.) | Cola de operaciones sin conexión | SQLite (`expo-sqlite`), tabla `pending_operations` | Cada fila contiene el `id` (UUID cliente, usado como `Idempotency-Key`), `tipo_operacion`, `entidad`, `payload` (JSON), `estado`, `intentos`, timestamps. No cifrado porque no contiene credenciales ni PII. |
| Preferencias de UI (último filtro usado, tema) | Preferencias no sensibles | `AsyncStorage` (vía `@react-native-async-storage/async-storage`) | No contiene datos personales ni de sesión. Se persiste para recordar la preferencia del usuario entre sesiones. |
| Contraseña del usuario | **NUNCA almacenar** | No se guarda ni en texto plano, ni cifrada, ni con hash, ni temporalmente en estado de React. Se envía únicamente en el body de `POST /api/auth/login` y `POST /api/auth/registro`. | Política: la contraseña solo viaja en la solicitud HTTPS al backend. El backend la verifica contra el hash de bcrypt. No se almacena en el cliente bajo ninguna circunstancia, ni siquiera en variables de estado en memoria después de la respuesta. |
| Números de tarjeta o datos de pago | **NUNCA almacenar** | No existen en el frontend. Los pagos se gestionan exclusivamente en el backend/pasarela. | El frontend no tiene formularios de tarjeta ni almacena datos de pago. |
| Geolocalización del usuario | Dato temporal de contexto | Solo se usa en memoria durante la sesión (`expo-location`). No se persiste. | Se usa para filtrar ofertas por cercanía. No se almacena para evitar tracking. |

## Mecanismos de almacenamiento — resumen

| Mecanismo | Propósito | Datos que contiene |
|-----------|-----------|-------------------|
| `expo-secure-store` | Almacenamiento cifrado (llave-valor) | `accessToken`, `refreshToken`, `Usuario` |
| `expo-sqlite` | Base de datos relacional local | `oferta_cache` (catálogo offline), `pending_operations` (cola de sync) |
| `AsyncStorage` | Almacenamiento persistente no cifrado (llave-valor) | Preferencias UI (tema, último filtro) |
| Memoria (estado React/Zustand) | Datos volátiles de la sesión actual | `Reserva` (consultada en tiempo real) |
| No se almacena | Datos prohibidos | Contraseñas, datos de pago |

## Referencias en el código

- `src/services/api.ts` — define `TOKEN_KEY = 'accessToken'` y lo usa en interceptor
- `src/store/authStore.ts` — guarda/lee `accessToken` y `usuario` en SecureStore
- `src/services/authService.ts` — el backend devuelve `accessToken` + `refreshToken`, pero `refreshToken` no se persiste actualmente
- `src/services/ofertasService.ts` — `Oferta` es el modelo de datos públicos que se cacheará en SQLite
- `src/services/reservasService.ts` — `Reserva` NO se cachea (cambia en tiempo real)