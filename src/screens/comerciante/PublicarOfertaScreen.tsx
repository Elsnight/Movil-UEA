import { View, Text } from 'react-native';
import { color, spacing, typography } from '../../theme/tokens';

export function PublicarOfertaScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background, padding: spacing.md }}>
      <Text style={[typography.heading, { color: color.textPrimary }]}>Publicar Oferta</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        {/* TODO: Formulario de creación de oferta con react-hook-form + zod */}
        Formulario pendiente
      </Text>
    </View>
  );
}