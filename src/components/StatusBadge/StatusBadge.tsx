import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, radius, typography } from '../../theme/tokens';

type StatusBadgeProps = {
  estado: string;
};

const config: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; bgColor: string; textColor: string; iconColor: string }> = {
  DISPONIBLE: { label: 'Disponible', icon: 'checkmark-circle', bgColor: color.successLightest, textColor: color.success, iconColor: color.success },
  PAUSADA: { label: 'Pausada', icon: 'pause-circle', bgColor: color.warningLight, textColor: color.warning, iconColor: color.warning },
  AGOTADA: { label: 'Agotada', icon: 'close-circle', bgColor: color.neutralLight, textColor: color.textSecondary, iconColor: color.textSecondary },
  EXPIRADA: { label: 'Expirada', icon: 'time', bgColor: color.dangerLight, textColor: color.danger, iconColor: color.danger },
};

export function StatusBadge({ estado }: StatusBadgeProps) {
  const cfg = config[estado] ?? { label: estado, icon: 'help-circle' as const, bgColor: color.neutralLight, textColor: color.textSecondary, iconColor: color.textSecondary };

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