import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatUSD } from '../../utils/formatUSD';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/Button/Button';
import { ofertasService, type Oferta } from '../../services/ofertasService';
import { ApiError } from '../../services/api';

export function MisOfertasScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [cambiando, setCambiando] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const res = await ofertasService.mias();
        if (activo) setOfertas(res.data);
      } catch (e) {
        if (activo) setError(e instanceof ApiError ? e.message : 'Error al cargar ofertas.');
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  async function toggleEstado(oferta: Oferta) {
    const nuevo = oferta.estado === 'DISPONIBLE' ? 'PAUSADA' : 'DISPONIBLE';
    setCambiando((p) => ({ ...p, [oferta.id]: true }));
    try {
      await ofertasService.cambiarEstado(oferta.id, nuevo);
      setOfertas((prev) => prev.map((o) => o.id === oferta.id ? { ...o, estado: nuevo } : o));
    } catch (e) {
      console.warn?.(e instanceof ApiError ? e.message : 'Error al cambiar estado.');
    } finally {
      setCambiando((p) => ({ ...p, [oferta.id]: false }));
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background }}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.md, paddingBottom: insets.bottom + spacing.lg }}>
        {error ? (
          <View style={{ backgroundColor: color.dangerLight, padding: spacing.sm, borderRadius: radius.input }}>
            <Text style={[typography.caption, { color: color.danger }]}>{error}</Text>
          </View>
        ) : ofertas.length === 0 ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Ionicons name="pricetags-outline" size={48} color={color.border} />
            <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
              No tienes ofertas publicadas. Usa la pestaña Publicar para crear una.
            </Text>
          </View>
        ) : ofertas.map((o) => (
          <View key={o.id} style={{ backgroundColor: color.surface, borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs }}>
            <Text style={[typography.body, { color: color.textPrimary, fontWeight: '600' }]}>{o.titulo}</Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              {formatUSD(o.precioOferta)} — Stock: {o.cantidadDisponible}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <View style={{ backgroundColor: o.estado === 'DISPONIBLE' ? color.successLight : o.estado === 'PAUSADA' ? color.warningLight : color.neutralLight, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.badge }}>
                <Text style={[typography.caption, { color: o.estado === 'DISPONIBLE' ? color.success : o.estado === 'PAUSADA' ? color.warning : color.textSecondary }]}>{o.estado}</Text>
              </View>
              {o.estado === 'DISPONIBLE' || o.estado === 'PAUSADA' ? (
                <Button
                  label={o.estado === 'DISPONIBLE' ? 'Pausar' : 'Reactivar'}
                  onPress={() => void toggleEstado(o)}
                  disabled={cambiando[o.id]}
                  loading={cambiando[o.id]}
                  size="sm"
                  variant={o.estado === 'DISPONIBLE' ? 'secondary' : 'primary'}
                />
              ) : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}