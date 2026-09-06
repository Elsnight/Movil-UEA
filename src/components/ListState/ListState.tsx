import { ReactNode } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, typography } from '../../theme/tokens';

type ListStateProps<T> = {
  status: 'loading' | 'empty' | 'error' | 'success';
  data?: T[];
  onRetry?: () => void;
  renderItem?: (item: T) => ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  emptyMessage?: string;
  errorMessage?: string;
};

export function ListState<T>({
  status,
  data,
  onRetry,
  renderItem,
  keyExtractor,
  emptyMessage = 'No hay resultados disponibles.',
  errorMessage = 'Ocurrió un error al cargar los datos.',
}: ListStateProps<T>) {
  if (status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.md,
        }}
        accessibilityRole="text"
        accessibilityLabel="Cargando datos"
      >
        <ActivityIndicator size="large" color={color.primary} />
        <Text style={[typography.body, { color: color.textSecondary }]}>
          Cargando…
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
        accessibilityRole="text"
        accessibilityLabel="Error al cargar datos"
      >
        <Ionicons name="alert-circle-outline" size={48} color={color.danger} />
        <Text
          style={[
            typography.body,
            { color: color.textSecondary, textAlign: 'center' },
          ]}
        >
          {errorMessage}
        </Text>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Reintentar"
            style={({ pressed }) => ({
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              backgroundColor: pressed ? color.primaryPressed : color.primary,
              borderRadius: 12,
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Text
              style={[
                typography.body,
                { color: color.surface, fontWeight: '600' },
              ]}
            >
              Reintentar
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (
    status === 'empty' ||
    (status === 'success' && data && data.length === 0)
  ) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          gap: spacing.md,
        }}
        accessibilityRole="text"
        accessibilityLabel={emptyMessage}
      >
        <Ionicons name="basket-outline" size={48} color={color.border} />
        <Text
          style={[
            typography.body,
            { color: color.textSecondary, textAlign: 'center' },
          ]}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  }

  if (status === 'success' && Array.isArray(data) && renderItem) {
    return (
      <FlatList
        data={data}
        keyExtractor={keyExtractor ?? ((_item, index) => String(index))}
        renderItem={({ item }) => <>{renderItem(item)}</>}
        style={styles.list}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
