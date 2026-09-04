import { View, Text } from 'react-native';
import { color, spacing, typography } from '../../theme/tokens';

export function DetalleOfertaScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background, padding: spacing.md }}>
      <Text style={[typography.heading, { color: color.textPrimary }]}>Detalle de Oferta</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        {/* TODO: Mostrar detalle completo de la oferta, botón de reserva, mapa del comercio */}
        Detalle pendiente de implementar
      </Text>
    </View>
  );
}