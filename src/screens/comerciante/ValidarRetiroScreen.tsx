import { View, Text } from 'react-native';
import { color, spacing, typography } from '../../theme/tokens';

export function ValidarRetiroScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background, padding: spacing.md }}>
      <Text style={[typography.heading, { color: color.textPrimary }]}>Validar Retiro</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        {/* TODO: Input para código de retiro, validar y confirmar */}
        Scanner/código pendiente
      </Text>
    </View>
  );
}