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
    let activo = true;
    void (async () => {
      try {
        await iniciarBD();
        await cargarSesion();
      } catch {
        // Error silencioso — el store ya está en isLoading:false
      }
      if (activo && useAuthStore.getState().usuario) {
        iniciarSyncAutomatico();
      }
    })();
    return () => { activo = false; };
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
