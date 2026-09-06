import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, typography } from '../../theme/tokens';
import type { OfflineBannerProps } from './OfflineBanner.types';

function formatearAntiguedad(minutos: number): string {
  if (minutos < 1) return 'menos de 1 minuto';
  if (minutos < 60) return `${minutos} minutos`;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 1) return `1 hora${mins > 0 ? ` y ${mins} minutos` : ''}`;
  return `${horas} horas${mins > 0 ? ` y ${mins} minutos` : ''}`;
}

export function OfflineBanner({ minutos }: OfflineBannerProps) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Mostrando datos de hace ${formatearAntiguedad(minutos)}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: color.warning,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        borderRadius: 6,
      }}
    >
      <Ionicons name="cloud-offline-outline" size={14} color={color.textPrimary} />
      <Text style={[typography.caption, { color: color.textPrimary, flexShrink: 1 }]}>
        Mostrando datos de hace {formatearAntiguedad(minutos)}
      </Text>
    </View>
  );
}