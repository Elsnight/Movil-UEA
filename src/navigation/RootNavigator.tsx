import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { AuthStack } from './AuthStack';
import { ConsumidorStack } from './ConsumidorStack';
import { ComercianteTabs } from './ComercianteTabs';
import { AdminTabs } from './AdminTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { usuario } = useAuthStore();

  if (!usuario) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario.rol === 'COMERCIANTE' ? (
        <Stack.Screen name="Comerciante" component={ComercianteTabs} />
      ) : usuario.rol === 'ADMINISTRADOR' ? (
        <Stack.Screen name="Administrador" component={AdminTabs} />
      ) : (
        <Stack.Screen name="Consumidor" component={ConsumidorStack} />
      )}
    </Stack.Navigator>
  );
}