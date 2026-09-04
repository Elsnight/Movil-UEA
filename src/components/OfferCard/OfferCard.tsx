import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { OfferCardProps } from './OfferCard.types';

export function OfferCard({
  titulo,
  comercioNombre,
  precioOriginal,
  precioOferta,
  imagenUrl,
  distanciaKm,
  estado: _estado,
  onPress,
  variant = 'full',
  accessibilityLabel,
}: OfferCardProps) {
  const isCompact = variant === 'compact';
  const descuento = Math.round((1 - precioOferta / precioOriginal) * 100);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${titulo} - ${precioOferta} euros en ${comercioNombre}`}
      style={({ pressed }) => ({
        backgroundColor: color.surface,
        borderRadius: radius.card,
        overflow: 'hidden',
        opacity: pressed ? 0.95 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flexDirection: isCompact ? 'row' : 'column', minHeight: isCompact ? 120 : 280 }}>
        <View
          style={{
            width: isCompact ? 100 : '100%',
            height: isCompact ? '100%' : 160,
            backgroundColor: color.border,
          }}
        >
          {imagenUrl ? null : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: color.background,
              }}
            >
              <Ionicons name="image-outline" size={32} color={color.border} />
            </View>
          )}
        </View>

        <View style={{ flex: 1, padding: spacing.md, gap: spacing.xs }}>
          <Text
            style={[typography.caption, { color: color.textSecondary }]}
            numberOfLines={1}
          >
            {comercioNombre}
          </Text>

          <Text
            style={[isCompact ? typography.body : typography.heading, { color: color.textPrimary }]}
            numberOfLines={2}
          >
            {titulo}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={[typography.price, { color: color.primary }]}>
              {precioOferta.toFixed(2)}€
            </Text>
            <Text
              style={[
                typography.caption,
                { color: color.textSecondary, textDecorationLine: 'line-through' },
              ]}
            >
              {precioOriginal.toFixed(2)}€
            </Text>
            <View
              style={{
                backgroundColor: color.successLight,
                paddingHorizontal: spacing.xs,
                paddingVertical: 2,
                borderRadius: radius.badge,
              }}
            >
              <Text style={[typography.caption, { color: color.success, fontWeight: '700' }]}>
                -{descuento}%
              </Text>
            </View>
          </View>

          {distanciaKm !== undefined && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="location-outline" size={14} color={color.textSecondary} />
              <Text style={[typography.caption, { color: color.textSecondary }]}>
                {(distanciaKm * 1).toFixed(1)} km
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}