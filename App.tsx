import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { iniciarBD } from './src/db/database';
import { iniciarSyncAutomatico } from './src/services/syncService';
import { queryClient } from './src/lib/queryClient';
import { color, spacing } from './src/theme/tokens';

function AppContent() {
  const cargarSesion = useAuthStore((s) => s.cargarSesion);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        await iniciarBD();
        await cargarSesion();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
      if (activo && useAuthStore.getState().usuario) {
        iniciarSyncAutomatico();
      }
    })();
    return () => { activo = false; };
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: color.dangerLight }}>
        <Text style={{ fontSize: 16, color: '#22201D', textAlign: 'center' }}>
          Error al iniciar: {error}
        </Text>
      </View>
    );
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}