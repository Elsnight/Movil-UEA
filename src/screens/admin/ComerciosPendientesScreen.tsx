import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/Button/Button';
import { adminService, type ComercioPendiente } from '../../services/adminService';
import { useAuthStore } from '../../store/authStore';
import { ApiError } from '../../services/api';

export function ComerciosPendientesScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comercios, setComercios] = useState<ComercioPendiente[]>([]);
  const [operando, setOperando] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let activo = true;
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const result = await adminService.listarPendientes();
        if (activo) setComercios(result.data);
      } catch (e) {
        if (activo) setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los comercios pendientes.');
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  async function cambiarEstado(comercioId: string, estado: 'ACTIVO' | 'SUSPENDIDO') {
    setOperando((prev) => ({ ...prev, [comercioId]: true }));
    try {
      await adminService.cambiarEstado(comercioId, estado);
      setComercios((prev) => prev.filter((c) => c.comercio_id !== comercioId));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo cambiar el estado.';
      console.warn?.(msg);
    } finally {
      setOperando((prev) => ({ ...prev, [comercioId]: false }));
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
        }}
      >
        <Text style={[typography.heading, { color: color.textPrimary }]}>
          Comercios pendientes
        </Text>
        <TouchableOpacity
          onPress={() => useAuthStore.getState().cerrarSesion()}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="log-out-outline" size={24} color={color.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.sm, paddingBottom: insets.bottom + spacing.lg }}>
        {error ? (
          <View style={{ padding: spacing.md, gap: spacing.sm, alignItems: 'center' }}>
            <Text style={[typography.body, { color: color.danger }]}>{error}</Text>
            <Button label="Reintentar" onPress={() => void (async () => {
              setLoading(true);
              setError('');
              try {
                const result = await adminService.listarPendientes();
                setComercios(result.data);
              } catch (e) {
                setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los comercios pendientes.');
              } finally {
                setLoading(false);
              }
            })()} variant="secondary" />
          </View>
        ) : comercios.length === 0 ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={48} color={color.success} />
            <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
              No hay comercios pendientes de validación.
            </Text>
          </View>
        ) : comercios.map((comercio) => (
          <View
            key={comercio.comercio_id}
            style={{
              margin: spacing.sm,
              backgroundColor: color.surface,
              borderRadius: radius.card,
              padding: spacing.md,
              gap: spacing.sm,
            }}
          >
            <Text style={[typography.body, { color: color.textPrimary, fontWeight: '600' }]}>
              {comercio.nombre_comercial}
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              {comercio.razon_social} — RUC: {comercio.ruc}
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Contacto: {comercio.correo_contacto}
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>
              Propietario: {comercio.propietario.nombres} {comercio.propietario.apellidos}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              <Button
                label="Aprobar"
                onPress={() => void cambiarEstado(comercio.comercio_id, 'ACTIVO')}
                disabled={operando[comercio.comercio_id]}
                loading={operando[comercio.comercio_id]}
                size="sm"
              />
              <Button
                label="Suspender"
                onPress={() => void cambiarEstado(comercio.comercio_id, 'SUSPENDIDO')}
                disabled={operando[comercio.comercio_id]}
                loading={operando[comercio.comercio_id]}
                variant="secondary"
                size="sm"
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}