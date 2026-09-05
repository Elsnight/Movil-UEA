import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { ListState } from '../../components/ListState/ListState';
import { Button } from '../../components/Button/Button';
import { useReservas, useCancelarReserva } from '../../hooks/useReservas';
import type { Reserva } from '../../services/reservasService';

const RESERVA_CONFIG = {
  PENDIENTE: { label: 'Pendiente', icon: 'time-outline' as const, color: color.warning, bgColor: '#FFF8E1' },
  CONFIRMADA: { label: 'Confirmada', icon: 'checkmark-circle' as const, color: color.success, bgColor: '#E8F5E9' },
  CANCELADA: { label: 'Cancelada', icon: 'close-circle' as const, color: color.textSecondary, bgColor: '#F5F0EB' },
  RETIRADA: { label: 'Retirada', icon: 'checkmark-done' as const, color: color.success, bgColor: '#E8F5E9' },
  VENCIDA: { label: 'Vencida', icon: 'alert-circle' as const, color: color.danger, bgColor: '#FFEBEE' },
} as const;

function ReservaCard({
  reserva,
  onCancelar,
  cancelando,
}: {
  reserva: Reserva;
  onCancelar: () => void;
  cancelando: boolean;
}) {
  const cfg = RESERVA_CONFIG[reserva.estado];
  const puedeCancelar = reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA';

  return (
    <View
      style={{
        backgroundColor: color.surface,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={[typography.body, { color: color.textPrimary, fontWeight: '600', flex: 1, marginRight: spacing.sm }]} numberOfLines={2}>
            {reserva.oferta.titulo}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: radius.badge,
              backgroundColor: cfg.bgColor,
            }}
            accessibilityRole="text"
            accessibilityLabel={`Estado: ${cfg.label}`}
          >
            <Ionicons name={cfg.icon} size={14} color={cfg.color} />
            <Text style={[typography.caption, { color: cfg.color, fontWeight: '600' }]}>
              {cfg.label}
            </Text>
          </View>
        </View>

        <Text style={[typography.caption, { color: color.textSecondary }]}>
          {reserva.oferta.comercio.nombre}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={[typography.price, { color: color.primary }]}>
            {reserva.oferta.precioOferta.toFixed(2)}€
          </Text>
          <Text style={[typography.caption, { color: color.textSecondary }]}>
            x{reserva.cantidad}
          </Text>
        </View>

        <Text style={[typography.caption, { color: color.textSecondary }]}>
          {new Date(reserva.createdAt).toLocaleDateString('es', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>

        {reserva.codigoRetiro && (
          <View
            style={{
              backgroundColor: color.background,
              padding: spacing.md,
              borderRadius: radius.input,
              gap: spacing.xs,
            }}
          >
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Código de retiro
            </Text>
            <Text
              style={[typography.display, { color: color.textPrimary, fontSize: 24, letterSpacing: 4 }]}
              accessibilityLabel={`Código de retiro: ${reserva.codigoRetiro}`}
            >
              {reserva.codigoRetiro}
            </Text>
          </View>
        )}

        {puedeCancelar && (
          <Button
            label={cancelando ? 'Cancelando…' : 'Cancelar reserva'}
            onPress={onCancelar}
            variant="ghost"
            disabled={cancelando}
            loading={cancelando}
            size="sm"
            accessibilityLabel="Cancelar reserva"
          />
        )}
      </View>
    </View>
  );
}

export function MisReservasScreen() {
  const insets = useSafeAreaInsets();
  const { data: reservas = [], isLoading, isError, refetch } = useReservas();
  const cancelarReserva = useCancelarReserva();
  const cancelandoId = cancelarReserva.isPending ? cancelarReserva.variables : null;

  const handleCancelar = (reserva: Reserva) => {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que quieres cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => cancelarReserva.mutate(reserva.id),
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
        <Text style={[typography.heading, { color: color.textPrimary }]}>
          Mis Reservas
        </Text>
      </View>

      <ListState
        status={isLoading ? 'loading' : isError ? 'error' : 'success'}
        data={reservas}
        onRetry={refetch}
        emptyMessage="Todavía no has hecho ninguna reserva. Explora las ofertas cerca de ti."
        errorMessage="No pudimos cargar tus reservas. Revisa tu conexión."
        renderItem={(item: Reserva) => (
          <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
            <ReservaCard
              reserva={item}
              onCancelar={() => handleCancelar(item)}
              cancelando={cancelandoId === item.id}
            />
          </View>
        )}
      />
    </View>
  );
}