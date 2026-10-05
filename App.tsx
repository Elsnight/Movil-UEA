import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState('');

  useEffect(() => {
    let active = true;

    iniciarBD().catch(() => {});

    useAuthStore.getState().cargarSesion()
      .then(() => {
        if (active && useAuthStore.getState().usuario) {
          iniciarSyncAutomatico();
        }
      })
      .catch((e: unknown) => {
        if (active) setInitError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => { active = false; };
  }, []);

  if (initError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: color.dangerLight }}>
        <Text style={{ fontSize: 16, color: '#22201D', textAlign: 'center' }}>
          Error al iniciar: {initError}
        </Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background }}>
        <ActivityIndicator size="large" color={color.primary} />
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