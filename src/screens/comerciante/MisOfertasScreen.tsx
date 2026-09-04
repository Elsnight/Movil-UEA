import { View, Text } from 'react-native';
import { color, spacing, typography } from '../../theme/tokens';

export function MisOfertasScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background, padding: spacing.md }}>
      <Text style={[typography.heading, { color: color.textPrimary }]}>Mis Ofertas</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        {/* TODO: Listar ofertas del comerciante, opciones de editar/pausar */}
        Lista de ofertas pendiente
      </Text>
    </View>
  );
}