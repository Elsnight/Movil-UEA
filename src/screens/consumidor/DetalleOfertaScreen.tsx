import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ConsumidorStackParamList } from '../../navigation/types';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/Button/Button';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';
import { useOfertaPorId } from '../../hooks/useOfertas';
import { useCrearReserva } from '../../hooks/useReservas';

type Props = NativeStackScreenProps<ConsumidorStackParamList, 'DetalleOferta'>;

export function DetalleOfertaScreen({ route, navigation }: Props) {
  const { ofertaId } = route.params;
  const insets = useSafeAreaInsets();
  const { data: oferta, isLoading, isError, refetch } = useOfertaPorId(ofertaId);
  const crearReserva = useCrearReserva();
  const [reservaExito, setReservaExito] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background }}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  if (isError || !oferta) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background, padding: spacing.lg, gap: spacing.md }}>
        <Ionicons name="alert-circle-outline" size={48} color={color.danger} />
        <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
          No pudimos cargar la información de la oferta.
        </Text>
        <Button label="Reintentar" onPress={() => refetch()} variant="secondary" />
      </View>
    );
  }

  const descuento = Math.round((1 - oferta.precioOferta / oferta.precioOriginal) * 100);
  const disponible = oferta.estado === 'DISPONIBLE' && oferta.cantidadDisponible > 0;

  const handleReservar = async () => {
    try {
      await crearReserva.mutateAsync({ ofertaId, cantidad: 1 });
      setReservaExito(true);
    } catch {
      // error state handled by mutation
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl + 80 }}
        bounces={false}
      >
        <View
          style={{
            width: '100%',
            height: 240,
            backgroundColor: color.border,
          }}
        >
          {oferta.imagenUrl ? null : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="image-outline" size={64} color={color.border} />
            </View>
          )}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              position: 'absolute',
              top: insets.top + spacing.sm,
              left: spacing.md,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: color.overlay,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={24} color={color.surface} />
          </TouchableOpacity>
        </View>

        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>
                {oferta.comercio.nombre}
              </Text>
              <Text style={[typography.heading, { color: color.textPrimary }]}>
                {oferta.titulo}
              </Text>
            </View>
            <StatusBadge estado={oferta.estado} />
          </View>

          {oferta.descripcion ? (
            <Text style={[typography.body, { color: color.textSecondary, lineHeight: 24 }]}>
              {oferta.descripcion}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Text style={[typography.price, { color: color.primary }]}>
              {oferta.precioOferta.toFixed(2)}€
            </Text>
            <Text style={[typography.body, { color: color.textSecondary, textDecorationLine: 'line-through' }]}>
              {oferta.precioOriginal.toFixed(2)}€
            </Text>
            <View style={{
              backgroundColor: color.successLight,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: radius.badge,
            }}>
              <Text style={[typography.caption, { color: color.success, fontWeight: '700' }]}>
                -{descuento}%
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: color.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="cube-outline" size={18} color={color.textSecondary} />
              <Text style={[typography.body, { color: color.textPrimary }]}>
                {oferta.cantidadDisponible} {oferta.unidad}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="calendar-outline" size={18} color={color.textSecondary} />
              <Text style={[typography.body, { color: color.textPrimary }]}>
                Vence {new Date(oferta.fechaVencimiento).toLocaleDateString('es')}
              </Text>
            </View>
          </View>

          <View style={{ padding: spacing.md, backgroundColor: color.surface, borderRadius: radius.card, gap: spacing.sm }}>
            <Text style={[typography.body, { color: color.textPrimary, fontWeight: '600' }]}>
              Ubicación
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="location" size={18} color={color.primary} />
              <Text style={[typography.body, { color: color.textSecondary, flex: 1 }]}>
                {oferta.comercio.direccion}
              </Text>
            </View>
            <View
              style={{
                height: 120,
                backgroundColor: color.background,
                borderRadius: radius.input,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="map-outline" size={32} color={color.border} />
              <Text style={[typography.caption, { color: color.textSecondary, marginTop: spacing.xs }]}>
                Mapa pendiente de integrar
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {reservaExito ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: color.successLight,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.md,
            borderTopWidth: 1,
            borderTopColor: color.success,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="checkmark-circle" size={24} color={color.success} />
            <View style={{ flex: 1 }}>
              <Text style={[typography.body, { color: color.success, fontWeight: '600' }]}>
                ¡Reserva confirmada!
              </Text>
              <Text style={[typography.caption, { color: color.success }]}>
                El código de retiro aparecerá en Mis Reservas.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: color.surface,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.md,
            borderTopWidth: 1,
            borderTopColor: color.border,
          }}
        >
          <Button
            label={
              crearReserva.isPending
                ? 'Reservando…'
                : `Reservar por ${oferta.precioOferta.toFixed(2)}€`
            }
            onPress={handleReservar}
            loading={crearReserva.isPending}
            disabled={!disponible || crearReserva.isPending}
            size="lg"
            accessibilityLabel={`Reservar ${oferta.titulo} por ${oferta.precioOferta.toFixed(2)} euros`}
          />
          {!disponible && (
            <Text style={[typography.caption, { color: color.danger, textAlign: 'center', marginTop: spacing.xs }]}>
              Esta oferta ya no está disponible
            </Text>
          )}
          {crearReserva.isError && (
            <Text style={[typography.caption, { color: color.danger, textAlign: 'center', marginTop: spacing.xs }]}>
              {(crearReserva.error as { response?: { data?: { mensaje?: string } } })?.response?.data?.mensaje ??
                'Error al realizar la reserva'}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}