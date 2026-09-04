import { View, Text } from 'react-native';
import { color, spacing, typography } from '../../theme/tokens';

export function MisReservasScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background, padding: spacing.md }}>
      <Text style={[typography.heading, { color: color.textPrimary }]}>Mis Reservas</Text>
      <Text style={[typography.body, { color: color.textSecondary }]}>
        {/* TODO: Listar reservas del consumidor, mostrar código de retiro, estado, opción de cancelar */}
        Lista de reservas pendiente
      </Text>
    </View>
  );
}