# Sincronización — flujo, estados y tiempos

## Diagrama de flujo

```
                  ┌─────────────┐
                  │  Usuario    │
                  │  realiza    │
                  │  operación  │
                  └──────┬──────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  ¿Hay conexión?     │
              └──────┬──────┬───────┘
                     │      │
                sí   │      │  no
                     │      ▼
              ┌───────────────┐
              │  Insertar en  │
              │ pending_ops   │
              │  estado:      │
              │  'pendiente'  │
              │  + UI optim.  │
              └───────┬───────┘
                      │
         ┌────────────┤
         │            │
         ▼            ▼
  ┌────────────┐ ┌──────────────┐
  │  Llamada   │ │  NetInfo     │
  │  API       │ │  detecta    │
  │  directa   │ │  reconexión │
  └────────────┘ └──────┬───────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  procesarCola()     │
              │  (FIFO por          │
              │   creado_en ASC)    │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Marcar como        │
              │  'enviando'         │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Llamar endpoint    │
              │  con header:        │
              │  Idempotency-Key    │
              │  = operation.id     │
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              │          │          │
              ▼          ▼          ▼
           ┌────┐   ┌──────┐   ┌───────┐
           │200 │   │ 409  │   │ red / │
           │    │   │      │   │ 5xx   │
           └─┬──┘   └──┬───┘   └──┬────┘
             │         │          │
             ▼         ▼          ▼
        ┌────────┐ ┌────────┐ ┌────────┐
        │Eliminar│ │Eliminar│ │Increm. │
        │ de la  │ │ de la  │ │intentos│
        │ cola   │ │ cola   │ │+backoff│
        │ ✅     │ │ (conf. │ │expon.  │
        │        │ │ serv.  │ └───┬────┘
        └────────┘ │ gana)  │     │
                   └────────┘     │
                           ┌──────┴──────┐
                           │ intentos ≥ 5 │
                           └──┬────┬──────┘
                         sí   │    │  no
                              ▼    │
                         ┌────────┐ │
                         │Marcar  │ │
                         │fallido │ │
                         │ ⚠️    │ │
                         └────────┘ │
                                    ▼
                           ┌───────────────┐
                           │ Reintentar    │
                           │ c/backoff     │
                           │ (NetInfo      │
                           │  listener o   │
                           │  manual)      │
                           └───────────────┘
```

## Estados de una operación

| Estado | Significado |
|--------|-------------|
| `pendiente` | Creada por el usuario, esperando sincronización |
| `enviando` | Se está enviando al servidor en este momento |
| `fallido` | Superó MAX_INTENTOS sin éxito. Visible en UI con ⚠️ |

No existe estado "confirmado" porque las operaciones exitosas se **eliminan** de la tabla.

## Tiempos de backoff exponencial

```
f(esbar(intentos) = min(2^intentos * 1000ms, 60000ms)

Intento  → Espera
  0      →  1.0s  (no se suele ejecutar con backoff en el primer intento)
  1      →  2.0s
  2      →  4.0s
  3      →  8.0s
  4      → 16.0s
  5      → 32.0s  (si falla, se marca 'fallido')
  ≥6     → no se reintenta (MAX_INTENTOS = 5)
  techo  → 60.0s  (para intento 6+ si se superara el max, pero no se usa)
```

## Cuándo se dispara `procesarCola()`

| Disparador | Automático | Descripción |
|------------|-----------|-------------|
| Reconexión de red | ✅ | NetInfo `addEventListener` detecta cambio a `isConnected: true` |
| Arranque de la app | ✅ | `iniciarSyncAutomatico()` en `App.tsx` registra el listener |
| Manual (botón) | ❌ (opcional) | Se puede llamar `procesarCola()` desde cualquier lugar |

## Idempotency-Key

Cada operación lleva su `id` (UUID generado en el cliente) como header
HTTP `Idempotency-Key` en la llamada al endpoint. El backend debe
implementar idempotencia: si recibe la misma key duplicada, debe
devolver la respuesta original sin duplicar el efecto.

## Endpoints esperados por el sync service

| tipo_operacion | Endpoint | Método | Body |
|---------------|----------|--------|------|
| `agregar_favorito` | `/api/favoritos` | POST | `{ oferta_id }` |
| `eliminar_favorito` | `/api/favoritos/:oferta_id` | DELETE | — |