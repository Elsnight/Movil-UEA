import { View, Text } from 'react-native';
import { color, spacing, typography } from '../../theme/tokens';

export function RegistroScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background, padding: spacing.md }}>
      <Text style={[typography.heading, { color: color.textPrimary }]}>Registro</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        {/* TODO: Implementar formulario con react-hook-form + zod, selector de rol CONSUMIDOR | COMERCIANTE */}
        Formulario de registro
      </Text>
    </View>
  );
}