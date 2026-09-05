import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { color, spacing, typography } from '../../theme/tokens';
import { useOfertas } from '../../hooks/useOfertas';
import { OfferCard } from '../../components/OfferCard/OfferCard';
import { ListState } from '../../components/ListState/ListState';
import type { Oferta } from '../../services/ofertasService';
import type { ConsumidorStackParamList } from '../../navigation/types';

export function ExplorarOfertasScreen() {
  const { data, isLoading, isError, refetch } = useOfertas();
  const ofertas = data?.data ?? [];
  const navigation = useNavigation<NativeStackNavigationProp<ConsumidorStackParamList>>();

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <Text style={[typography.heading, { color: color.textPrimary, padding: spacing.md }]}>
        Ofertas cerca de ti
      </Text>
      <ListState
        status={isLoading ? 'loading' : isError ? 'error' : 'success'}
        data={ofertas}
        onRetry={refetch}
        emptyMessage="No hay ofertas activas cerca de tu ubicación ahora mismo."
        errorMessage="No pudimos cargar las ofertas. Revisa tu conexión."
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