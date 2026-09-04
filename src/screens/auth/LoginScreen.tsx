import { View, Text } from 'react-native';
import { color, spacing, typography } from '../../theme/tokens';

export function LoginScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background, padding: spacing.md }}>
      <Text style={[typography.heading, { color: color.textPrimary }]}>Login</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        {/* TODO: Implementar formulario con react-hook-form + zod */}
        Formulario de inicio de sesión
      </Text>
    </View>
  );
}