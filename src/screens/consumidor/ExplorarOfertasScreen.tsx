import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, typography } from '../../theme/tokens';
import { useOfertas } from '../../hooks/useOfertas';
import { OfferCard } from '../../components/OfferCard/OfferCard';
import { ListState } from '../../components/ListState/ListState';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { useAuthStore } from '../../store/authStore';
import type { Oferta } from '../../services/ofertasService';
import type { ConsumidorStackParamList } from '../../navigation/types';

export function ExplorarOfertasScreen() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFromCache,
    cacheAgeMinutos,
    errorMessage,
  } = useOfertas();
  const ofertas = data ?? [];
  const navigation = useNavigation<NativeStackNavigationProp<ConsumidorStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.sm }}>
        <Text style={[typography.heading, { color: color.textPrimary }]}>
          Ofertas cerca de ti
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
      {isFromCache && cacheAgeMinutos !== null && <OfflineBanner minutos={cacheAgeMinutos} />}
      <ListState
        status={isLoading ? 'loading' : isError ? 'error' : 'success'}
        data={ofertas}
        onRetry={refetch}
        emptyMessage="No hay ofertas activas cerca de tu ubicación ahora mismo."
        errorMessage={errorMessage}
        renderItem={(item: Oferta) => (
          <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
            <OfferCard
              titulo={item.titulo}
              comercioNombre={item.comercio.nombre}
              precioOriginal={item.precioOriginal}
              precioOferta={item.precioOferta}
              imagenUrl={item.imagenUrl}
              estado={item.estado}
              onPress={() => navigation.navigate('DetalleOferta', { ofertaId: item.id })}
            />
          </View>
        )}
      />
    </View>
  );
}
