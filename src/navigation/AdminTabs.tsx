import { View, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { color, spacing, typography } from '../theme/tokens';
import { useAuthStore } from '../store/authStore';
import { ComerciosPendientesScreen } from '../screens/admin/ComerciosPendientesScreen';
import { GestionarScreen } from '../screens/comerciante/GestionarScreen';
import type { AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminTabs() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.sm }}>
        <Text style={[typography.heading, { color: color.textPrimary }]}>Admin</Text>
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
        <Tab.Screen name="Pendientes" component={ComerciosPendientesScreen}
          options={{ tabBarLabel: 'Pendientes', tabBarIcon: ({ color: c, size }) => <Ionicons name="storefront" size={size} color={c} /> }} />
        <Tab.Screen name="Gestionar" component={GestionarScreen}
          options={{ tabBarLabel: 'Gestionar', tabBarIcon: ({ color: c, size }) => <Ionicons name="settings" size={size} color={c} /> }} />
      </Tab.Navigator>
    </View>
  );
}