# Estrategia de resolución de conflictos

## Principio general

La estrategia de resolución depende de la **entidad afectada**, no del
tipo de operación. Cada entidad tiene una regla fija:

| Entidad | Estrategia | Comportamiento |
|---------|-----------|----------------|
| `favorito` | **Cliente gana** | Se aplica siempre la última intención del usuario. Si el servidor responde 409, se descarta la respuesta del servidor y se reintenta forzando la escritura. |
| (futuro) `reserva` | **Servidor gana** | Si el servidor responde 409 por conflicto de stock, se descarta la operación local y se marca como fallida. El usuario ve un error explícito. |

## Implementación actual

En `syncService.ts`, el manejo de 409:

```
if (status === 409) {
  // Para favoritos: cliente gana → se elimina de la cola (se descarta
  // la operación local porque el toggle más reciente reemplaza al anterior).
  // Para reservas (futuro): servidor gana → mismo comportamiento, pero
  // se notifica al usuario.
  await pendingRepository.eliminar(op.id);
  return;
}
```

Para **favoritos**, la resolución es trivial: si dos toggles consecutivos
se hicieron offline, el último es el que importa. La operación anterior
se descarta simplemente porque ya no refleja la intención actual.

## Qué se sacrifica con esta estrategia

### Favoritos (cliente gana)

| Se sacrifica | Consecuencia |
|-------------|-------------|
| Detectar que el comercio/oferta fue eliminada mientras el usuario estaba offline | El favorito se agregará localmente, pero al sincronizar, si el backend rechaza el POST porque la oferta ya no existe, la operación quedará como fallida. El usuario verá un ⚠️ y podrá actuar. |
| Consistencia entre cliente y servidor si hubo toggles múltiples offline | La última intención del usuario siempre prevalece. Si toggleó "favorito → no favorito → favorito" estando offline, al sincronizar solo importa el estado final. |

**A cambio de:** Experiencia de usuario simple y predecible. El usuario
nunca ve su cambio "deshecho" por el servidor.

### Reservas (servidor gana) — plan futuro

| Se sacrifica | Consecuencia |
|-------------|-------------|
| La intención del usuario si perdió una carrera por el último cupo | El usuario pensó que tenía una reserva confirmada (la vio en UI), pero al sincronizar el servidor la rechaza por falta de stock. |
| La capacidad de reservar cuando hay baja conectividad | Si el usuario está en una zona sin señal, no puede reservar porque la operación será rechazada al sincronizar si el stock se agotó mientras tanto. |

**A cambio de:** Garantía de que **nunca** hay sobreventa. El comercio
nunca recibe más reservas que unidades disponibles, incluso si varios
clientes intentaron reservar el último cupo simultáneamente.

## Flujo para 409

1. El sync service envía la operación con `Idempotency-Key`.
2. El backend detecta conflicto (stock insuficiente, recurso eliminado).
3. Backend responde **409 Conflict** con un mensaje descriptivo.
4. Sync service decide según la regla de la entidad:
   - **Favorito:** elimina de la cola (se descarta).
   - **Reserva (futuro):** marca como fallido y notifica al usuario.
5. La UI refleja el resultado:
   - ⚠️ en favoritos si el servidor rechazó el toggle.
   - ❌ "Reserva rechazada por falta de stock" en reservas.

## Diseño a futuro

Si se añaden más entidades al modo offline, la tabla de reglas debe
extenderse:

| Entidad | Estrategia | Motivo |
|---------|-----------|--------|
| `comercio` (editar datos) | Servidor gana | Los datos del comercio son la fuente de verdad. |
| `oferta` (publicar) | Servidor gana | El servidor valida duplicados, fechas, etc. |
| `perfil` (editar nombre/email) | Última escritura gana | Sin fusión; el último valor es el correcto. |