# Verificación de persistencia de sesión — prueba manual

## Propósito

Confirmar que el `accessToken`, `refreshToken` y el objeto `Usuario` se
persisten en `expo-secure-store` y se rehidratan correctamente al arrancar
la app, de modo que el usuario **no tenga que iniciar sesión de nuevo**
si cerró la app completamente.

## Prerrequisitos

1. App instalada en un dispositivo físico o simulador/emulador.
2. Usuario registrado y con sesión iniciada al menos una vez.
3. `expo-secure-store` funcionando (no falla en simuladores sin
   soporte de cifrado — en iOS Simulator y Android Emulator funciona
   con store emulado).

## Pasos

### Paso 1 — Iniciar sesión

1. Abrir la app.
2. Si aparece la pantalla de login, iniciar sesión con credenciales
   válidas.
3. Confirmar que la navegación cambia a la pantalla de ofertas
   (Consumidor) o a Mis Ofertas (Comerciante).

### Paso 2 — Forzar cierre completo de la app

**iOS Simulator:**
- Cmd + Shift + H (dos veces) para abrir el app switcher.
- Deslizar la tarjeta de RescateFresco hacia arriba para cerrarla.
- Alternativa: `xcrun simctl terminate <device> com.rescatefresco.app`

**Android Emulator:**
- Abrir la lista de apps recientes (botón cuadrado en navegación).
- Deslizar RescateFresco hacia arriba o al costado para cerrarla.
- Alternativa: `adb shell am force-stop com.rescatefresco.app`

**Dispositivo físico:**
- Abrir el app switcher.
- Deslizar RescateFresco fuera de la pantalla para cerrarla por
  completo.

> **Importante:** No basta con poner la app en segundo plano
> (Home/App Switcher sin cerrar). La prueba requiere que el proceso
> se termine completamente para verificar que la rehidratación lee
> desde SecureStore y no solo desde memoria de Zustand.

### Paso 3 — Reabrir la app

1. Volver a abrir RescateFresco desde el menú de apps o desde el
   icono del launcher.
2. **Resultado esperado:** La app debe mostrar la pantalla de
   ofertas directamente, **sin pasar por la pantalla de login**.
3. Si en lugar de eso aparece la pantalla de login, la prueba FALLA.

### Paso 4 — Verificar que las llamadas API funcionan

1. Una vez en la pantalla de ofertas, verificar que la lista de
   ofertas se carga correctamente (sin errores de autenticación).
2. Confirmar que el interceptor de axios está adjuntando el token
   correctamente (puede verse en la consola de red del emulador o
   con herramientas de debugging).

## Resultado esperado

- Al reabrir la app, el usuario sigue autenticado.
- Las pantallas protegidas se renderizan sin pasar por AuthStack.
- Las peticiones API incluyen el `Authorization: Bearer <token>`
  correcto.

## Qué probar en caso de fallo

| Síntoma | Causa posible | Solución |
|---------|---------------|----------|
| Login aparece al reabrir | `cargarSesion()` arroja excepción o SecureStore devuelve `null` | Verificar que `SecureStore.getItemAsync` no lance error. Probar con `expo-secure-store` diagnostic. |
| Login aparece pero con token corrupto | El JSON de `usuario` está malformado | Verificar `JSON.parse` en `cargarSesion()`. |
| API devuelve 401 | El `accessToken` expiró y no hay renovación automática | Verificar que `refreshToken` se guardó. Implementar renovación en interceptor de respuesta. |

## Resultado real de la prueba

<!-- Rellenar después de ejecutar la prueba en el simulador/dispositivo:
- Fecha: __________
- Dispositivo: __________
- Resultado: [ÉXITO / FALLO - descripción]
- Notas: __________
-->