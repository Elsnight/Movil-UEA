import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, radius, typography } from '../../theme/tokens';

type StatusBadgeProps = {
  estado: 'DISPONIBLE' | 'PAUSADA' | 'AGOTADA' | 'EXPIRADA';
};

const config = {
  DISPONIBLE: {
    label: 'Disponible',
    icon: 'checkmark-circle' as const,
    bgColor: '#E8F5E9',
    textColor: color.success,
    iconColor: color.success,
  },
  PAUSADA: {
    label: 'Pausada',
    icon: 'pause-circle' as const,
    bgColor: '#FFF8E1',
    textColor: color.warning,
    iconColor: color.warning,
  },
  AGOTADA: {
    label: 'Agotada',
    icon: 'close-circle' as const,
    bgColor: '#F5F0EB',
    textColor: color.textSecondary,
    iconColor: color.textSecondary,
  },
  EXPIRADA: {
    label: 'Expirada',
    icon: 'time' as const,
    bgColor: '#FFEBEE',
    textColor: color.danger,
    iconColor: color.danger,
  },
} as const;

export function StatusBadge({ estado }: StatusBadgeProps) {
  const cfg = config[estado];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.badge,
        backgroundColor: cfg.bgColor,
        alignSelf: 'flex-start',
      }}
      accessibilityRole="text"
      accessibilityLabel={`Estado: ${cfg.label}`}
    >
      <Ionicons name={cfg.icon} size={14} color={cfg.iconColor} />
      <Text style={[typography.caption, { color: cfg.textColor, fontWeight: '600' }]}>
        {cfg.label}
      </Text>
    </View>
  );
}