---
name: react-native-conventions
description: Convenciones de código, nomenclatura y estructura para el proyecto RescateFresco (React Native/Expo). Úsala antes de crear o modificar cualquier archivo .ts/.tsx en src/.
---

# Convenciones React Native — RescateFresco

## Nomenclatura
- Componentes: PascalCase (`Button`, `OfferCard`, `StatusBadge`)
- Servicios: camelCase con sufijo `Service` (`authService`, `ofertasService`)
- Stores (Zustand): camelCase con sufijo `Store` (`authStore`)
- Hooks: camelCase con prefijo `use` (`useOfertas`, `useReservas`)
- Archivos de tipos: mismo nombre que el componente + `.types.ts` (`Button.types.ts`)

## Estructura
- Un componente por carpeta, un componente por archivo
- Props tipadas con `interface` en archivo `*.types.ts` separado
- Sin estilos inline salvo casos triviales (1-2 propiedades)
- Todo color/espaciado/tipografía desde `src/theme/tokens.ts`, nunca valores fijos

## Responsabilidades
- Componentes del catálogo (`src/components/`) NUNCA importan servicios, hooks de React Query, navegación o stores. Reciben todo por props.
- Stores de Zustand solo guardan estado y mutaciones. NUNCA llaman a axios.
- Servicios (`src/services/`) son funciones puras que llaman al backend. No conocen React.
- Hooks de React Query son el puente servicios ↔ componentes. Manejan loading/error/cache.
- Pantallas (`src/screens/`) ensamblan componentes y hooks. Conocen navegación y datos.

## Accesibilidad
- `accessibilityRole` en todo elemento interactivo
- `accessibilityLabel` descriptivo en lenguaje natural
- Área táctil mínima 44×44 pt
- Color nunca es el único medio para transmitir información

## Tokens
- Nivel primitivo: `primitive.green400`, `primitive.space.16`, `primitive.fontSize.16`
- Nivel semántico: `color.success`, `spacing.md`, `radius.card`, `typography.body`
- Componentes importan solo del nivel semántico