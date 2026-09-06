# Retención de datos locales

Este documento detalla qué datos se almacenan localmente en el
dispositivo, con qué finalidad, durante cuánto tiempo, y cómo se
eliminan.

## Tabla de retención

| Dato | ¿Qué es? | Finalidad | Duración | Eliminación |
|------|----------|-----------|----------|-------------|
| `accessToken` (JWT) | Token de acceso cifrado en `expo-secure-store` | Autenticar solicitudes al backend sin pedir credenciales en cada llamada. | 15 minutos (tiempo de expiración del JWT). Se borra también al cerrar sesión. | `cerrarSesion()` → `SecureStore.deleteItemAsync(TOKEN_KEY)` |
| `refreshToken` (JWT) | Token de renovación cifrado en `expo-secure-store` | Renovar el `accessToken` automáticamente cuando expira, sin intervención del usuario. | Variable (días/semanas, según configuración del backend). Se borra al cerrar sesión. | `cerrarSesion()` → `SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)` |
| `Usuario` (`{ id, email, nombre, rol }`) | Objeto JSON cifrado en `expo-secure-store` | Rehidratar la sesión al arrancar la app: saber quién es el usuario, qué rol tiene, y mostrar la navegación correcta sin consultar al backend. | Misma duración que la sesión. Se borra al cerrar sesión. | `cerrarSesion()` → `SecureStore.deleteItemAsync(USUARIO_KEY)` |
| Catálogo de ofertas (`oferta_cache` en SQLite) | Datos públicos de ofertas alimentarias disponibles | Permitir explorar el catálogo sin conexión a internet. Incluye todas las columnas necesarias para mostrar la oferta en la UI. | Hasta la siguiente sincronización exitosa o hasta el cierre de sesión, lo que ocurra primero. Cada fila tiene un `synced_at` que se actualiza al descargar datos nuevos. | `cerrarSesion()` → `reiniciarDb()` (DROP + recrea tablas vacías). También se sobrescribe en cada `guardarOfertas()` exitoso. |
| Cola de operaciones pendientes (`pending_operations` en SQLite) | Operaciones de escritura realizadas sin conexión (favoritos, etc.) | Garantizar que ninguna acción del usuario se pierda aunque no haya internet. Se sincronizan cuando la conexión vuelve. | Hasta que la operación se sincroniza exitosamente (se elimina la fila). Si supera 5 intentos, queda como `fallido` permanentemente visible en UI. Se borra todo al cerrar sesión. | `cerrarSesion()` → `reiniciarDb()`. También se elimina por operación individual al sincronizar con éxito (`pendingRepository.eliminar`). |
| Preferencias de UI (tema, último filtro) | *No implementado actualmente* | Recordar preferencias del usuario entre sesiones. | Indefinido (hasta que el usuario cambie la preferencia o cierre sesión). | Al cerrar sesión si se almacena por usuario (prefijo por id de usuario). |

## Datos que no se almacenan

| Dato | Por qué no se almacena |
|------|----------------------|
| Contraseña del usuario | Nunca se guarda en el cliente. Solo viaja en el body de `POST /api/auth/login` y `POST /api/auth/registro`. |
| Números de tarjeta o datos de pago | Los pagos se gestionan exclusivamente en el backend/pasarela. El frontend nunca ve ni almacena estos datos. |

## Mecanismo de borrado completo (`cerrarSesion`)

La función `cerrarSesion()` en `authStore.ts` ejecuta esta secuencia:

1. `SecureStore.deleteItemAsync(TOKEN_KEY)` → borra accessToken
2. `SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)` → borra refreshToken
3. `SecureStore.deleteItemAsync(USUARIO_KEY)` → borra datos de usuario
4. `reiniciarDb()` → cierra BD, elimina archivo `rescatefresco.db`, lo recrea vacío con el schema

No hay datos cuyo ciclo de vida exceda la sesión del usuario, salvo las
preferencias de UI (cuando se implementen), que se borrarían con un
prefijo de usuario.

## Política de retención

> **Principio:** Ningún dato personal permanece en el dispositivo después
> del cierre de sesión. La caché de ofertas (datos públicos) se conserva
> entre sesiones únicamente si el usuario no cierra sesión, y se
> sobrescribe en cada sincronización exitosa.