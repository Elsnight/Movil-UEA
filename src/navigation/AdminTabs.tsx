import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { color, typography } from '../theme/tokens';
import { ComerciosPendientesScreen } from '../screens/admin/ComerciosPendientesScreen';
import type { AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.textSecondary,
        tabBarLabelStyle: { ...typography.caption },
        tabBarStyle: { backgroundColor: color.surface, borderTopColor: color.border },
      }}
    >
      <Tab.Screen
        name="Pendientes"
        component={ComerciosPendientesScreen}
        options={{
          tabBarLabel: 'Pendientes',
          tabBarIcon: ({ color: iconColor, size }) => (
            <Ionicons name="storefront" size={size} color={iconColor} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}