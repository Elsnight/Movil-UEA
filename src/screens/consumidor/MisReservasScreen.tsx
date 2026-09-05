import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { ListState } from '../../components/ListState/ListState';
import { useReservas } from '../../hooks/useReservas';
import { useAuthStore } from '../../store/authStore';
import type { Reserva } from '../../services/reservasService';

const RESERVA_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
  PENDIENTE_PAGO: { label: 'Pendiente', icon: 'time-outline', color: color.warning, bgColor: '#FFF8E1' },
  LISTA_RETIRO: { label: 'Lista para retirar', icon: 'checkmark-circle', color: color.success, bgColor: '#E8F5E9' },
  RETIRADA: { label: 'Retirada', icon: 'checkmark-done', color: color.success, bgColor: '#E8F5E9' },
  CANCELADA: { label: 'Cancelada', icon: 'close-circle', color: color.textSecondary, bgColor: '#F5F0EB' },
  EXPIRADA: { label: 'Vencida', icon: 'alert-circle', color: color.danger, bgColor: '#FFEBEE' },
};

export function MisReservasScreen() {
  const insets = useSafeAreaInsets();
  const { data: reservas = [], isLoading, isError, refetch } = useReservas();

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[typography.heading, { color: color.textPrimary }]}>
          Mis Reservas
        </Text>
        <TouchableOpacity
          onPress={() => useAuthStore.getState().cerrarSesion()}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <Ionicons name="log-out-outline" size={24} color={color.textSecondary} />
        </TouchableOpacity>
      </View>

      <ListState
        status={isLoading ? 'loading' : isError ? 'error' : 'success'}
        data={reservas}
        onRetry={refetch}
        emptyMessage="Todavía no has hecho ninguna reserva. Explora las ofertas cerca de ti."
        errorMessage="No pudimos cargar tus reservas. Revisa tu conexión."
        renderItem={(item: Reserva) => {
          const cfg = RESERVA_CONFIG[item.estado] ?? { label: item.estado, icon: 'help-circle' as const, color: color.textSecondary, bgColor: '#F5F0EB' };
          return (
            <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
              <View style={{ backgroundColor: color.surface, borderRadius: radius.card, overflow: 'hidden', padding: spacing.md, gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={[typography.body, { color: color.textPrimary, fontWeight: '600', flex: 1, marginRight: spacing.sm }]} numberOfLines={2}>
                    {item.oferta?.titulo ?? 'Reserva'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.badge, backgroundColor: cfg.bgColor }} accessibilityRole="text" accessibilityLabel={`Estado: ${cfg.label}`}>
                    <Ionicons name={cfg.icon} size={14} color={cfg.color} />
                    <Text style={[typography.caption, { color: cfg.color, fontWeight: '600' }]}>{cfg.label}</Text>
                  </View>
                </View>

                {item.oferta?.comercio?.nombre ? (
                  <Text style={[typography.caption, { color: color.textSecondary }]}>
                    {item.oferta.comercio.nombre}
                  </Text>
                ) : null}

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Text style={[typography.price, { color: color.primary }]}>
                    {item.oferta?.precioOferta?.toFixed(2) ?? '0.00'}€
                  </Text>
                  <Text style={[typography.caption, { color: color.textSecondary }]}>
                    x{item.cantidad}
                  </Text>
                </View>

                {item.createdAt ? (
                  <Text style={[typography.caption, { color: color.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                ) : null}

                {item.codigoRetiro ? (
                  <View style={{ backgroundColor: color.background, padding: spacing.md, borderRadius: radius.input, gap: spacing.xs }}>
                    <Text style={[typography.caption, { color: color.textSecondary }]}>Código de retiro</Text>
                    <Text style={[typography.display, { color: color.textPrimary, fontSize: 24, letterSpacing: 4 }]} accessibilityLabel={`Código de retiro: ${item.codigoRetiro}`}>
                      {item.codigoRetiro}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}