# RescateFresco — App Móvil

App de economía circular que conecta comercios con excedentes de comida próxima a vencer con consumidores que quieren comprarla a precio reducido.

## Estructura de `src/`

| Carpeta | Propósito |
|---|---|
| `theme/` | Tokens primitivos y semánticos (color, tipografía, espaciado, radios). Todo valor visual parte de aquí. |
| `components/` | Componentes reutilizables del catálogo. Independientes de backend, navegación y estado global. Reciben todo por props. |
| `screens/` | Pantallas organizadas por rol (`auth/`, `consumidor/`, `comerciante/`). Ensamblan componentes y hooks. |
| `navigation/` | Configuración de navegación (stacks y tabs) según rol del usuario autenticado. |
| `services/` | Llamadas al backend REST vía axios. Funciones puras sin conocimiento de React. |
| `store/` | Estado global con Zustand (solo auth). Nunca llama a servicios directamente. |
| `hooks/` | Hooks de React Query que puentean servicios con componentes. Manejan loading/error/cache. |

## Convenciones

- Componentes en PascalCase, servicios en camelCase + `Service`, stores con sufijo `Store`
- Props tipadas con `interface` en archivos `*.types.ts`
- Estilos desde `theme/tokens.ts`, sin valores fijos
- Accesibilidad: `accessibilityRole`, `accessibilityLabel`, área táctil ≥ 44×44 pt
- Color nunca como único canal informativo (texto + ícono siempre)