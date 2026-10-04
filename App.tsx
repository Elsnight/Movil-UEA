import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { iniciarBD } from './src/db/database';
import { iniciarSyncAutomatico } from './src/services/syncService';
import { queryClient } from './src/lib/queryClient';

function AppContent() {
  const cargarSesion = useAuthStore((s) => s.cargarSesion);

  useEffect(() => {
    void (async () => {
      await iniciarBD();
      await cargarSesion();
      if (useAuthStore.getState().usuario) iniciarSyncAutomatico();
    })();
  }, []);

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
