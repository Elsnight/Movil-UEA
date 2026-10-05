import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatUSD } from '../../utils/formatUSD';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/Button/Button';
import { ListState } from '../../components/ListState/ListState';
import { useReservas } from '../../hooks/useReservas';
import { useAuthStore } from '../../store/authStore';
import { reservasService, type Reserva } from '../../services/reservasService';
import { pagosService } from '../../services/pagosService';
import { ApiError } from '../../services/api';

const RESERVA_CONFIG: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
  PENDIENTE_PAGO: { label: 'Pendiente', icon: 'time-outline', color: color.warning, bgColor: color.warningLight },
  LISTA_RETIRO: { label: 'Lista para retirar', icon: 'checkmark-circle', color: color.success, bgColor: color.successLightest },
  RETIRADA: { label: 'Retirada', icon: 'checkmark-done', color: color.success, bgColor: color.successLightest },
  CANCELADA: { label: 'Cancelada', icon: 'close-circle', color: color.textSecondary, bgColor: color.neutralLight },
  EXPIRADA: { label: 'Vencida', icon: 'alert-circle', color: color.danger, bgColor: color.dangerLight },
};

export function MisReservasScreen() {
  const insets = useSafeAreaInsets();
  const { data: reservas = [], isLoading, isError, refetch } = useReservas();
  const [operandoId, setOperandoId] = useState<string | null>(null);

  async function pagar(item: Reserva) {
    setOperandoId(item.id);
    try {
      await pagosService.pagar({ reserva_id: item.id, metodo_pago: 'TARJETA' });
      await refetch();
    } catch (e) {
      Alert.alert('Error', e instanceof ApiError ? e.message : 'No se pudo procesar el pago.');
    } finally {
      setOperandoId(null);
    }
  }

  async function cancelar(item: Reserva) {
    setOperandoId(item.id);
    try {
      await reservasService.cancelar(item.id);
      await refetch();
    } catch (e) {
      Alert.alert('Error', e instanceof ApiError ? e.message : 'No se pudo cancelar.');
    } finally {
      setOperandoId(null);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[typography.heading, { color: color.textPrimary }]}>Mis Reservas</Text>
        <TouchableOpacity onPress={() => useAuthStore.getState().cerrarSesion()}
          accessibilityRole="button" accessibilityLabel="Cerrar sesión"
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="log-out-outline" size={24} color={color.textSecondary} />
        </TouchableOpacity>
      </View>

      <ListState
        status={isLoading ? 'loading' : isError ? 'error' : 'success'}
        data={reservas}
        keyExtractor={(item) => item.id}
        onRetry={refetch}
        emptyMessage="Todavía no has hecho ninguna reserva."
        errorMessage="No pudimos cargar tus reservas."
        renderItem={(item: Reserva) => {
          const cfg = RESERVA_CONFIG[item.estado] ?? { label: item.estado, icon: 'help-circle' as const, color: color.textSecondary, bgColor: color.neutralLight };
          const puedePagar = item.estado === 'PENDIENTE_PAGO';
          const puedeCancelar = item.estado === 'PENDIENTE_PAGO' || item.estado === 'PAGADA';
          return (
            <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
              <View style={{ backgroundColor: color.surface, borderRadius: radius.card, padding: spacing.md, gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={[typography.body, { color: color.textPrimary, fontWeight: '600', flex: 1, marginRight: spacing.sm }]} numberOfLines={2}>
                    {item.oferta?.titulo ?? 'Reserva'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.badge, backgroundColor: cfg.bgColor }}>
                    <Ionicons name={cfg.icon} size={14} color={cfg.color} />
                    <Text style={[typography.caption, { color: cfg.color, fontWeight: '600' }]}>{cfg.label}</Text>
                  </View>
                </View>
                {item.oferta?.comercio?.nombre ? <Text style={[typography.caption, { color: color.textSecondary }]}>{item.oferta.comercio.nombre}</Text> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Text style={[typography.price, { color: color.primary }]}>{formatUSD(item.oferta?.precioOferta ?? 0)}</Text>
                  <Text style={[typography.caption, { color: color.textSecondary }]}>x{item.items?.[0]?.cantidad ?? 1}</Text>
                </View>
                <Text style={[typography.caption, { color: color.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                {item.codigo_retiro && (item.estado === 'LISTA_RETIRO' || item.estado === 'PAGADA') ? (
                  <View style={{ backgroundColor: color.background, padding: spacing.md, borderRadius: radius.input, gap: spacing.xs }}>
                    <Text style={[typography.caption, { color: color.textSecondary }]}>Código de retiro</Text>
                    <Text style={[typography.display, { color: color.textPrimary, fontSize: 24, letterSpacing: 4 }]}>{item.codigo_retiro}</Text>
                  </View>
                ) : null}
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {puedePagar ? (
                    <Button label={`Pagar ${formatUSD(item.total_pagar ?? item.oferta?.precioOferta ?? 0)}`}
                      onPress={() => void pagar(item)} loading={operandoId === item.id} disabled={operandoId === item.id}
                      size="sm" />
                  ) : null}
                  {puedeCancelar ? (
                    <Button label="Cancelar" variant="secondary"
                      onPress={() => void cancelar(item)} loading={operandoId === item.id} disabled={operandoId === item.id}
                      size="sm" />
                  ) : null}
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}