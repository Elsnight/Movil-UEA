import { Pressable, Text, ActivityIndicator, View, ViewStyle } from 'react-native';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { ButtonProps } from './Button.types';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'md',
  accessibilityLabel,
  iconSlot,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  const bgColor = isPrimary
    ? color.primary
    : isSecondary
      ? color.surface
      : 'transparent';
  const textColor = isPrimary ? color.surface : isGhost ? color.primary : color.textPrimary;
  const borderColor = isSecondary ? color.border : 'transparent';
  const pressedBg = isPrimary ? color.primaryPressed : isSecondary ? color.background : color.border;

  const heightMap = { sm: 40, md: 48, lg: 56 } as const;
  const paddingMap = { sm: spacing.sm, md: spacing.md, lg: spacing.lg } as const;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: heightMap[size],
          paddingHorizontal: paddingMap[size],
          borderRadius: radius.button,
          backgroundColor: pressed ? pressedBg : bgColor,
          borderWidth: isSecondary ? 1 : 0,
          borderColor,
          opacity: disabled ? 0.5 : 1,
          minWidth: 44,
          gap: spacing.sm,
        } as ViewStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {iconSlot && <View>{iconSlot}</View>}
          <Text
            style={[
              typography.body,
              {
                color: textColor,
                fontWeight: '600',
              },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}