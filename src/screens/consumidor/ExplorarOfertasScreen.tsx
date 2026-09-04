import { View, Text } from 'react-native';
import { color, spacing, typography } from '../../theme/tokens';
import { useOfertas } from '../../hooks/useOfertas';
import { OfferCard } from '../../components/OfferCard/OfferCard';
import { ListState } from '../../components/ListState/ListState';
import type { Oferta } from '../../services/ofertasService';

export function ExplorarOfertasScreen() {
  const { data, isLoading, isError, refetch } = useOfertas();
  const ofertas = data?.data ?? [];

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
              onPress={() => {
                // TODO: Navegar a DetalleOfertaScreen con item.id
              }}
            />
          </View>
        )}
      />
    </View>
  );
}