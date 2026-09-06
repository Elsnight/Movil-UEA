# Informe Técnico Semana 10 — RescateFresco App

## 1. Estructura real del proyecto

```
rescatefresco-app/
├── App.tsx                              ← Raíz: QueryClientProvider + ThemeProvider + NavigationContainer
├── index.ts                             ← Entry point Expo
├── app.json
├── package.json
├── tsconfig.json                        ← strict: true
├── eslint.config.js                     ← Flat config ESLint 9
├── .prettierrc
├── .env                                 ← EXPO_PUBLIC_API_URL
├── src/
│   ├── README.md
│   ├── theme/
│   │   ├── tokens.ts                    ← Primitivos + semánticos
│   │   └── ThemeProvider.tsx             ← SafeAreaProvider + StatusBar
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.types.ts
│   │   ├── OfferCard/
│   │   │   ├── OfferCard.tsx
│   │   │   └── OfferCard.types.ts
│   │   ├── StatusBadge/
│   │   │   └── StatusBadge.tsx
│   │   └── ListState/
│   │       └── ListState.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegistroScreen.tsx
│   │   ├── consumidor/
│   │   │   ├── ExplorarOfertasScreen.tsx
│   │   │   ├── DetalleOfertaScreen.tsx
│   │   │   └── MisReservasScreen.tsx
│   │   └── comerciante/
│   │       ├── MisOfertasScreen.tsx      ← ESQUELETO (solo TODO)
│   │       ├── PublicarOfertaScreen.tsx   ← ESQUELETO (solo TODO)
│   │       └── ValidarRetiroScreen.tsx    ← ESQUELETO (solo TODO)
│   ├── navigation/
│   │   ├── types.ts
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   ├── ConsumidorStack.tsx
│   │   ├── ConsumidorTabs.tsx
│   │   └── ComercianteTabs.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── ofertasService.ts
│   │   └── reservasService.ts
│   ├── store/
│   │   └── authStore.ts
│   └── hooks/
│       ├── useOfertas.ts
│       └── useReservas.ts
```

### Total componentes en `src/components/`: 4
1. `Button/` — Button.tsx + Button.types.ts
2. `OfferCard/` — OfferCard.tsx + OfferCard.types.ts
3. `StatusBadge/` — StatusBadge.tsx
4. `ListState/` — ListState.tsx

---

## 2. Tokens de diseño reales

Archivo: `src/theme/tokens.ts`

### Nivel primitivo

```typescript
export const primitive = {
  orange50: '#FFF4EC',
  orange100: '#FFE4CF',
  orange400: '#FF8A3D',
  orange600: '#E8641C',

  green50: '#F1F8F0',
  green400: '#5FA85A',
  green600: '#3D7A3A',

  charcoal900: '#22201D',
  charcoal700: '#4A453F',

  neutral200: '#E7E2DA',
  neutral50: '#FDFBF7',

  red500: '#E8493C',
  yellow400: '#F5B942',

  white: '#FFFFFF',

  fontSize: { 10:10, 12:12, 13:13, 14:14, 16:16, 18:18, 20:20, 22:22, 24:24, 28:28, 32:32 },
  lineHeight: { 14:14, 16:16, 18:18, 20:20, 22:22, 24:24, 26:26, 28:28, 32:32, 36:36, 40:40 },
  fontWeight: { regular:'400', medium:'500', semiBold:'600', bold:'700' },
  space:    { 0:0, 2:2, 4:4, 6:6, 8:8, 10:10, 12:12, 14:14, 16:16, 18:18, 20:20, 24:24, 28:28, 32:32, 40:40, 48:48 },
  radius:   { 4:4, 6:6, 8:8, 10:10, 12:12, 16:16, 20:20, 999:999 },
} as const;
```

### Nivel semántico

```typescript
export const color = {
  background:     '#FDFBF7',     // neutral50
  surface:        '#FFFFFF',     // white
  textPrimary:    '#22201D',     // charcoal900
  textSecondary:  '#4A453F',     // charcoal700
  primary:        '#FF8A3D',     // orange400
  primaryPressed: '#E8641C',     // orange600
  primaryLight:   '#FFF4EC',     // orange50
  success:        '#5FA85A',     // green400
  successLight:   '#F1F8F0',     // green50
  warning:        '#F5B942',     // yellow400
  danger:         '#E8493C',     // red500
  border:         '#E7E2DA',     // neutral200
  overlay:        'rgba(34,32,29,0.6)',
};

export const spacing = {
  xs: 4,  sm: 8,  md: 16,  lg: 24,  xl: 32,  xxl: 48,
};

export const radius = {
  button: 12,  card: 20,  badge: 999,  input: 10,
};

export const typography = {
  display:  { fontSize:32, lineHeight:40, fontWeight:'700' },
  heading:  { fontSize:22, lineHeight:28, fontWeight:'600' },
  body:     { fontSize:16, lineHeight:22, fontWeight:'400' },
  caption:  { fontSize:13, lineHeight:18, fontWeight:'500' },
  price:    { fontSize:20, lineHeight:24, fontWeight:'700' },
};
```

### Diferencia con paleta propuesta originalmente

La paleta propuesta en `design-direction.md` coincidía con estos valores reales. No hay desviaciones: los primitivos orange/green/charcoal/neutral/red/yellow y los mapeos semánticos son exactamente los planificados. La única adición es `primaryLight: orange50` que no estaba en la propuesta original.

---

## 3. Interfaz pública real por componente

### 3.1 Button (`src/components/Button/Button.types.ts`)

```typescript
export interface ButtonProps {
  label: string;                           // Dato de entrada
  onPress: PressableProps['onPress'];      // Devolución de llamada (callback)
  variant?: 'primary' | 'secondary' | 'ghost';  // Configuración de presentación
  disabled?: boolean;                      // Configuración de presentación
  loading?: boolean;                       // Configuración de presentación
  size?: 'sm' | 'md' | 'lg';              // Configuración de presentación
  accessibilityLabel?: string;             // Configuración de presentación
  iconSlot?: ReactNode;                    // Contenido delegado
}
```

**Violaciones de independencia:** Ninguna. Solo importa de `../../theme/tokens`.

---

### 3.2 OfferCard (`src/components/OfferCard/OfferCard.types.ts`)

```typescript
export interface OfferCardProps {
  titulo: string;                          // Dato de entrada
  comercioNombre: string;                  // Dato de entrada
  precioOriginal: number;                  // Dato de entrada
  precioOferta: number;                    // Dato de entrada
  imagenUrl?: string;                      // Dato de entrada
  distanciaKm?: number;                    // Dato de entrada
  estado: string;                          // Dato de entrada
  onPress: () => void;                     // Devolución de llamada (callback)
  variant?: 'compact' | 'full';           // Configuración de presentación
  accessibilityLabel?: string;             // Configuración de presentación
}
```

**Violaciones de independencia:** Ninguna. Solo importa de `../../theme/tokens` y `@expo/vector-icons`.

---

### 3.3 StatusBadge (`src/components/StatusBadge/StatusBadge.tsx`)

```typescript
type StatusBadgeProps = {
  estado: string;                          // Dato de entrada
};
```

**Nota:** No tiene archivo `.types.ts` separado; la interfaz está inline en el mismo `.tsx`.

**Violaciones de independencia:** Ninguna. Solo importa de `../../theme/tokens` y `@expo/vector-icons`.

---

### 3.4 ListState (`src/components/ListState/ListState.tsx`)

```typescript
type ListStateProps<T> = {
  status: 'loading' | 'empty' | 'error' | 'success';  // Configuración de presentación
  data?: T[];                                           // Dato de entrada
  onRetry?: () => void;                                  // Devolución de llamada (callback)
  renderItem?: (item: T) => ReactNode;                   // Contenido delegado
  emptyMessage?: string;                                 // Dato de entrada
  errorMessage?: string;                                  // Dato de entrada
};
```

**Nota:** No tiene archivo `.types.ts` separado; la interfaz está inline en el mismo `.tsx`.

**Violaciones de independencia:** Ninguna. Solo importa de `../../theme/tokens` y `@expo/vector-icons`.

---

## 4. Estados resueltos (loading / empty / error)

El componente `ListState` resuelve explícitamente los tres casos. Fragmentos de código extraídos de `src/components/ListState/ListState.tsx`:

### Rama loading (líneas 25-34)
```typescript
if (status === 'loading') {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
      <ActivityIndicator size="large" color={color.primary} />
      <Text style={[typography.body, { color: color.textSecondary }]}>Cargando…</Text>
    </View>
  );
}
```

### Rama error (líneas 36-76)
```typescript
if (status === 'error') {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
      <Ionicons name="alert-circle-outline" size={48} color={color.danger} />
      <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
        {errorMessage}
      </Text>
      {onRetry && (
        <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Reintentar"
          style={({ pressed }) => ({
            paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
            backgroundColor: pressed ? color.primaryPressed : color.primary,
            borderRadius: 12, minWidth: 44, minHeight: 44,
            alignItems: 'center', justifyContent: 'center',
          })}
        >
          <Text style={[typography.body, { color: color.surface, fontWeight: '600' }]}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}
```

### Rama vacío (líneas 78-97)
```typescript
if (status === 'empty' || (status === 'success' && data && data.length === 0)) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
      <Ionicons name="basket-outline" size={48} color={color.border} />
      <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
        {emptyMessage}
      </Text>
    </View>
  );
}
```

---

## 5. Código fuente completo por componente

### 5.1 Button (`src/components/Button/Button.tsx`)

```typescript
import { Pressable, Text, ActivityIndicator, View, ViewStyle } from 'react-native';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { ButtonProps } from './Button.types';

export function Button({
  label, onPress, variant = 'primary', disabled = false, loading = false,
  size = 'md', accessibilityLabel, iconSlot,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  const bgColor = isPrimary ? color.primary : isSecondary ? color.surface : 'transparent';
  const textColor = isPrimary ? color.surface : isGhost ? color.primary : color.textPrimary;
  const borderColor = isSecondary ? color.border : 'transparent';
  const pressedBg = isPrimary ? color.primaryPressed : isSecondary ? color.background : color.border;

  const heightMap = { sm: 40, md: 48, lg: 56 } as const;
  const paddingMap = { sm: spacing.sm, md: spacing.md, lg: spacing.lg } as const;

  return (
    <Pressable
      onPress={onPress} disabled={disabled || loading}
      accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: heightMap[size], paddingHorizontal: paddingMap[size],
        borderRadius: radius.button,
        backgroundColor: pressed ? pressedBg : bgColor,
        borderWidth: isSecondary ? 1 : 0, borderColor,
        opacity: disabled ? 0.5 : 1, minWidth: 44, gap: spacing.sm,
      } as ViewStyle]}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {iconSlot && <View>{iconSlot}</View>}
          <Text style={[typography.body, { color: textColor, fontWeight: '600' }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
```

### 5.2 OfferCard (`src/components/OfferCard/OfferCard.tsx`)

```typescript
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { OfferCardProps } from './OfferCard.types';

export function OfferCard({
  titulo, comercioNombre, precioOriginal, precioOferta, imagenUrl,
  distanciaKm, estado: _estado, onPress, variant = 'full', accessibilityLabel,
}: OfferCardProps) {
  const isCompact = variant === 'compact';
  const descuento = Math.round((1 - precioOferta / precioOriginal) * 100);

  return (
    <Pressable onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${titulo} - ${precioOferta} euros en ${comercioNombre}`}
      style={({ pressed }) => ({
        backgroundColor: color.surface, borderRadius: radius.card, overflow: 'hidden',
        opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
      })}>
      <View style={{ flexDirection: isCompact ? 'row' : 'column', minHeight: isCompact ? 120 : 280 }}>
        <View style={{ width: isCompact ? 100 : '100%', height: isCompact ? '100%' : 160, backgroundColor: color.border }}>
          {imagenUrl ? null : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background }}>
              <Ionicons name="image-outline" size={32} color={color.border} />
            </View>
          )}
        </View>
        <View style={{ flex: 1, padding: spacing.md, gap: spacing.xs }}>
          <Text style={[typography.caption, { color: color.textSecondary }]} numberOfLines={1}>{comercioNombre}</Text>
          <Text style={[isCompact ? typography.body : typography.heading, { color: color.textPrimary }]} numberOfLines={2}>{titulo}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={[typography.price, { color: color.primary }]}>{precioOferta.toFixed(2)}€</Text>
            <Text style={[typography.caption, { color: color.textSecondary, textDecorationLine: 'line-through' }]}>{precioOriginal.toFixed(2)}€</Text>
            <View style={{ backgroundColor: color.successLight, paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.badge }}>
              <Text style={[typography.caption, { color: color.success, fontWeight: '700' }]}>-{descuento}%</Text>
            </View>
          </View>
          {distanciaKm !== undefined && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="location-outline" size={14} color={color.textSecondary} />
              <Text style={[typography.caption, { color: color.textSecondary }]}>{(distanciaKm * 1).toFixed(1)} km</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
```

### 5.3 StatusBadge (`src/components/StatusBadge/StatusBadge.tsx`)

```typescript
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, radius, typography } from '../../theme/tokens';

type StatusBadgeProps = { estado: string };

const config: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; bgColor: string; textColor: string; iconColor: string }> = {
  DISPONIBLE: { label: 'Disponible', icon: 'checkmark-circle', bgColor: '#E8F5E9', textColor: color.success, iconColor: color.success },
  PAUSADA:    { label: 'Pausada',    icon: 'pause-circle',     bgColor: '#FFF8E1', textColor: color.warning, iconColor: color.warning },
  AGOTADA:    { label: 'Agotada',    icon: 'close-circle',    bgColor: '#F5F0EB', textColor: color.textSecondary, iconColor: color.textSecondary },
  EXPIRADA:   { label: 'Expirada',   icon: 'time',            bgColor: '#FFEBEE', textColor: color.danger, iconColor: color.danger },
};

export function StatusBadge({ estado }: StatusBadgeProps) {
  const cfg = config[estado] ?? { label: estado, icon: 'help-circle' as const, bgColor: '#F5F0EB', textColor: color.textSecondary, iconColor: color.textSecondary };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.badge, backgroundColor: cfg.bgColor, alignSelf: 'flex-start' }}
      accessibilityRole="text" accessibilityLabel={`Estado: ${cfg.label}`}>
      <Ionicons name={cfg.icon} size={14} color={cfg.iconColor} />
      <Text style={[typography.caption, { color: cfg.textColor, fontWeight: '600' }]}>{cfg.label}</Text>
    </View>
  );
}
```

### 5.4 ListState (`src/components/ListState/ListState.tsx`)

```typescript
import { ReactNode } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, typography } from '../../theme/tokens';

type ListStateProps<T> = {
  status: 'loading' | 'empty' | 'error' | 'success';
  data?: T[];
  onRetry?: () => void;
  renderItem?: (item: T) => ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
};

export function ListState<T>({
  status, data, onRetry, renderItem,
  emptyMessage = 'No hay resultados disponibles.',
  errorMessage = 'Ocurrió un error al cargar los datos.',
}: ListStateProps<T>) {
  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={[typography.body, { color: color.textSecondary }]}>Cargando…</Text>
      </View>
    );
  }
  if (status === 'error') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
        <Ionicons name="alert-circle-outline" size={48} color={color.danger} />
        <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>{errorMessage}</Text>
        {onRetry && (
          <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Reintentar"
            style={({ pressed }) => ({
              paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
              backgroundColor: pressed ? color.primaryPressed : color.primary,
              borderRadius: 12, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center',
            })}>
            <Text style={[typography.body, { color: color.surface, fontWeight: '600' }]}>Reintentar</Text>
          </Pressable>
        )}
      </View>
    );
  }
  if (status === 'empty' || (status === 'success' && data && data.length === 0)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.md }}>
        <Ionicons name="basket-outline" size={48} color={color.border} />
        <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>{emptyMessage}</Text>
      </View>
    );
  }
  if (status === 'success' && Array.isArray(data) && renderItem) {
    return <>{data.map((item, index) => <View key={index}>{renderItem(item)}</View>)}</>;
  }
  return null;
}
```

---

## 6. Pantalla ensamblada y endpoint real

### Archivo: `src/screens/consumidor/ExplorarOfertasScreen.tsx`

#### Endpoint real usado

**Ruta:** `GET /api/ofertas`

**Origen en `src/services/ofertasService.ts` línea 22:**
```typescript
const res = await api.get<RailwayEnvelope<unknown>>('/api/ofertas', { params });
return extraerLista(res.data.data);
```

**Método HTTP:** GET  
**Parámetros query opcionales:** `page`, `limit`, `latitud`, `longitud`, `radio`  
**Envoltorio esperado de Railway:** `{ success: boolean, data: T[] }`  
**Helper `extraerLista()`:** desempaqueta tanto arrays planos como objetos `{ data: [...] }` paginados

#### Componentes del catálogo que usa (verificados por imports):
- `OfferCard` — para renderizar cada oferta
- `ListState` — para manejar loading/error/empty/success

#### Código completo de la pantalla:

```typescript
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, typography } from '../../theme/tokens';
import { useOfertas } from '../../hooks/useOfertas';
import { OfferCard } from '../../components/OfferCard/OfferCard';
import { ListState } from '../../components/ListState/ListState';
import { useAuthStore } from '../../store/authStore';
import type { Oferta } from '../../services/ofertasService';
import type { ConsumidorStackParamList } from '../../navigation/types';

export function ExplorarOfertasScreen() {
  const { data, isLoading, isError, refetch } = useOfertas();
  const ofertas = data ?? [];
  const navigation = useNavigation<NativeStackNavigationProp<ConsumidorStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.sm }}>
        <Text style={[typography.heading, { color: color.textPrimary }]}>Ofertas cerca de ti</Text>
        <TouchableOpacity onPress={() => useAuthStore.getState().cerrarSesion()}
          accessibilityRole="button" accessibilityLabel="Cerrar sesión"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ minHeight: 44, justifyContent: 'center' }}>
          <Ionicons name="log-out-outline" size={24} color={color.textSecondary} />
        </TouchableOpacity>
      </View>
      <ListState
        status={isLoading ? 'loading' : isError ? 'error' : 'success'}
        data={ofertas} onRetry={refetch}
        emptyMessage="No hay ofertas activas cerca de tu ubicación ahora mismo."
        errorMessage="No pudimos cargar las ofertas. Revisa tu conexión."
        renderItem={(item: Oferta) => (
          <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
            <OfferCard
              titulo={item.titulo} comercioNombre={item.comercio.nombre}
              precioOriginal={item.precioOriginal} precioOferta={item.precioOferta}
              imagenUrl={item.imagenUrl} estado={item.estado}
              onPress={() => navigation.navigate('DetalleOferta', { ofertaId: item.id })}
            />
          </View>
        )}
      />
    </View>
  );
}
```

---

## 7. Tabla de contraste calculada sobre datos reales

Fórmula WCAG 2.1: luminancia relativa L = 0.2126R + 0.7152G + 0.0722B, ratio = (L1+0.05)/(L2+0.05).

| Par evaluado | Fondo | Texto | Ratio | AA (4.5:1) | AAA (7:1) |
|---|---|---|---|---|---|
| textPrimary (#22201D) sobre background (#FDFBF7) | #FDFBF7 | #22201D | **13.85:1** | ✅ Cumple | ✅ Cumple |
| textSecondary (#4A453F) sobre background (#FDFBF7) | #FDFBF7 | #4A453F | **7.96:1** | ✅ Cumple | ✅ Cumple |
| textPrimary (#22201D) sobre surface (#FFFFFF) | #FFFFFF | #22201D | **15.50:1** | ✅ Cumple | ✅ Cumple |
| primary (#FF8A3D) sobre surface (#FFFFFF) – precio OfferCard | #FFFFFF | #FF8A3D | **2.30:1** | ❌ NO cumple | ❌ NO cumple |
| white (#FFFFFF) sobre primary (#FF8A3D) – botón primario | #FF8A3D | #FFFFFF | **2.30:1** | ❌ NO cumple | ❌ NO cumple |
| success (#5FA85A) sobre successLight (#F1F8F0) – badge descuento | #F1F8F0 | #5FA85A | **3.32:1** | ❌ NO cumple | ❌ NO cumple |
| danger (#E8493C) sobre #FFEBEE – error banner | #FFEBEE | #E8493C | **3.52:1** | ❌ NO cumple (texto < 18pt) | ❌ |

### Colores alternativos que sí cumplirían AA

| Par actual | Problema | Alternativa sugerida | Ratio nuevo |
|---|---|---|---|
| #FF8A3D sobre #FFFFFF | 2.30:1 — insuficiente para texto | Usar `orange600: #E8641C` para texto sobre fondo blanco | **4.89:1** ✅ |
| #FFFFFF sobre #FF8A3D (botón) | 2.30:1 — insuficiente | Usar `orange600: #E8641C` como fondo del botón | **4.89:1** ✅ |
| #5FA85A sobre #F1F8F0 | 3.32:1 para caption | Usar `green600: #3D7A3A` para texto | **5.82:1** ✅ |

**Nota:** `typography.price` (20px bold) y `typography.caption` (13px medium) califican como texto "grande" (>18px bold) solo `price`. El caption (13px) es texto normal, requiere 4.5:1.

---

## 8. Estado de compilación y repositorio

### Comando para levantar el proyecto

```bash
cd rescatefresco-app
npx expo start
```

Definido en `package.json` scripts: `{ "start": "expo start" }`

### Resultado de compilación

```bash
$ npx tsc --noEmit
# Sin errores (exit code 0)
```

El proyecto compila correctamente sin errores de TypeScript.

### Repositorio Git

```bash
$ git remote -v
# Sin salida — no hay repositorio remoto configurado
```

El proyecto tiene git inicializado localmente (se ve `.git/`) pero **no tiene un remoto configurado**. Falta asociarlo a un repositorio remoto (GitHub, GitLab, etc.) para subir el código.

### Esqueletos pendientes (NO implementados)

- `src/screens/comerciante/MisOfertasScreen.tsx` — solo placeholder con TODO
- `src/screens/comerciante/PublicarOfertaScreen.tsx` — solo placeholder con TODO
- `src/screens/comerciante/ValidarRetiroScreen.tsx` — solo placeholder con TODO
- Contraste de `primary (#FF8A3D)` sobre blanco: **2.30:1**, no cumple AA
- Contraste de `success (#5FA85A)` sobre `successLight`: **3.32:1**, no cumple AA para caption