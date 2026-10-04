import { FlatList, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, typography } from '../../theme/tokens';
import { useOfertas } from '../../hooks/useOfertas';
import { useFavoritos } from '../../hooks/useFavoritos';
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFromCache,
    cacheAgeMinutos,
    errorMessage,
  } = useOfertas();
  const { favoritos, fallidos, alternarFavorito } = useFavoritos();
  const ofertas = data ?? [];
  const navigation =
    useNavigation<NativeStackNavigationProp<ConsumidorStackParamList>>();
  const insets = useSafeAreaInsets();

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
          Ofertas cerca de ti
        </Text>
        <TouchableOpacity
          onPress={() => useAuthStore.getState().cerrarSesion()}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={color.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {isFromCache && cacheAgeMinutos !== null && (
        <OfflineBanner minutos={cacheAgeMinutos} />
      )}
      {isLoading ? (
        <ListState
          status="loading"
          data={[]}
          keyExtractor={() => ''}
          renderItem={() => null}
        />
      ) : isError && ofertas.length === 0 ? (
        <ListState
          status="error"
          data={[]}
          keyExtractor={() => ''}
          onRetry={refetch}
          emptyMessage="No hay ofertas activas cerca de tu ubicación ahora mismo."
          errorMessage={errorMessage}
          renderItem={() => null}
        />
      ) : (
        <FlatList
          data={ofertas}
          keyExtractor={(item: Oferta) => item.id}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          renderItem={(info: { item: Oferta }) => {
            const item = info.item;
            return (
              <View
                style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}
              >
                <OfferCard
                  titulo={item.titulo}
                  comercioNombre={item.comercio.nombre}
                  precioOriginal={item.precioOriginal}
                  precioOferta={item.precioOferta}
                  imagenUrl={item.imagenUrl}
                  estado={item.estado}
                  isFavorite={!!favoritos[item.comercio.id]}
                  favoriteSyncFailed={!!fallidos[item.comercio.id]}
                  onToggleFavorite={() => void alternarFavorito(item.comercio.id)}
                  onPress={() =>
                    navigation.navigate('DetalleOferta', { ofertaId: item.id })
                  }
                />
              </View>
            );
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ alignItems: 'center', padding: spacing.md }}>
                <ActivityIndicator size="small" color={color.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}