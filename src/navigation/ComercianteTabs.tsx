import { View, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, typography } from '../theme/tokens';
import { useAuthStore } from '../store/authStore';
import { MisOfertasScreen } from '../screens/comerciante/MisOfertasScreen';
import { PublicarOfertaScreen } from '../screens/comerciante/PublicarOfertaScreen';
import { GestionarScreen } from '../screens/comerciante/GestionarScreen';
import { ValidarRetiroScreen } from '../screens/comerciante/ValidarRetiroScreen';
import type { ComercianteTabParamList } from './types';

const Tab = createBottomTabNavigator<ComercianteTabParamList>();

export function ComercianteTabs() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.sm }}>
        <Text style={[typography.heading, { color: color.textPrimary }]}>Comerciante</Text>
        <TouchableOpacity onPress={() => useAuthStore.getState().cerrarSesion()}
          accessibilityRole="button" accessibilityLabel="Cerrar sesión"
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="log-out-outline" size={24} color={color.textSecondary} />
        </TouchableOpacity>
      </View>
      <Tab.Navigator screenOptions={{ headerShown: false,
        tabBarActiveTintColor: color.primary, tabBarInactiveTintColor: color.textSecondary,
        tabBarLabelStyle: { ...typography.caption },
        tabBarStyle: { backgroundColor: color.surface, borderTopColor: color.border } }}>
        <Tab.Screen name="MisOfertas" component={MisOfertasScreen}
          options={{ tabBarLabel: 'Mis Ofertas', tabBarIcon: ({ color: c, size }) => <Ionicons name="pricetags" size={size} color={c} /> }} />
        <Tab.Screen name="Publicar" component={PublicarOfertaScreen}
          options={{ tabBarLabel: 'Publicar', tabBarIcon: ({ color: c, size }) => <Ionicons name="add-circle" size={size} color={c} /> }} />
        <Tab.Screen name="Gestionar" component={GestionarScreen}
          options={{ tabBarLabel: 'Gestionar', tabBarIcon: ({ color: c, size }) => <Ionicons name="storefront" size={size} color={c} /> }} />
        <Tab.Screen name="ValidarRetiro" component={ValidarRetiroScreen}
          options={{ tabBarLabel: 'Validar', tabBarIcon: ({ color: c, size }) => <Ionicons name="scan" size={size} color={c} /> }} />
      </Tab.Navigator>
    </View>
  );
}