# Decisión de base de datos local — expo-sqlite

## Contexto

RescateFresco necesita almacenar localmente:
- **Catálogo de ofertas** (~500 registros máximo) para consulta offline.
- **Cola de operaciones pendientes** (~decenas de registros) para
  sincronización diferida.

Ambos conjuntos son de tamaño pequeño a mediano y requieren consultas
simples (SELECT por id, INSERT/UPDATE/DELETE por lote).

## Alternativas evaluadas

| Criterio | expo-sqlite | WatermelonDB | Realm | AsyncStorage puro |
|----------|-------------|--------------|-------|-------------------|
| **Complejidad de configuración con Expo (sin ejectar)** | Mínima — `expo install expo-sqlite` y funciona inmediatamente. Sin config adicional. | Media — requiere babel plugin, decoradores, y sincronización manual con el backend. | Alta — requiere eject de Expo o New Architecture. No es compatible con Expo Go sin prebuild. | Mínima — `expo install @react-native-async-storage/async-storage` y listo. |
| **Comunidad y mantenimiento** | Mantenido por el equipo de Expo (comité de SDK). Actualizaciones sincronizadas con cada versión de Expo. | Comunidad amplia (~10k stars), pero el ritmo de releases es más lento y la compatibilidad con Expo SDK 57 no está garantizada sin prebuild. | Comunidad grande (~16k stars), pero MongoDB redujo soporte en mobile. La última versión estable tiene problemas con New Architecture. | Comunidad enorme (~18k stars), mantenimiento estable. |
| **Curva de aprendizaje** | Baja — SQL es conocido por cualquier desarrollador. La API de expo-sqlite (`execAsync`, `getAllAsync`) es trivial. | Alta — requiere aprender el ORM, decoradores de modelo, el sistema de sincronización (`sync()`) y los pipelines de migración. | Media — requiere aprender Realm objetos, el schema en JS, y el sistema de sincronización Atlas Device Sync (innecesario aquí). | Baja — API get/set simple, pero obliga a serializar/deserializar todo como JSON, sin consultas. |
| **Volumen de datos** | Ideal para <10k registros. Indexación simple con CREATE INDEX. | Diseñado para apps con miles de registros y sincronización bidireccional compleja. Sobredimensionado para ~500 ofertas. | Excesivo para este volumen. Realm está pensado para datasets más grandes o sincronización con MongoDB Atlas. | Funcional hasta ~1MB, pero ineficiente para listas: hay que leer y parsear todo el JSON para filtrar. |

## Decisión

**Se elige expo-sqlite** porque:

1. **No requiere ejectar ni prebuild.** Funciona en Expo Go y en builds
   nativos sin configuración adicional.
2. **SQL es suficiente** para las consultas que necesita la app:
   SELECT con filtros, INSERT/REPLACE, DELETE. No necesitamos un ORM.
3. **Bajo mantenimiento.** Al ser parte del SDK de Expo, las
   actualizaciones vienen con cada versión del framework, sin
   conflictos de versiones.
4. **Volumen adecuado.** Para ~500 ofertas y una cola de <50
   operaciones, expo-sqlite rinde sin problemas. WatermelonDB o Realm
   añaden complejidad que no se justifica.

## Riesgo mitigado

Si en el futuro la app creciera a miles de ofertas con sincronización
compleja (conflictos, merge), se podría migrar a WatermelonDB
aprovechando que ambas usan SQLite internamente. Por ahora,
expo-sqlite cubre todos los casos de uso.