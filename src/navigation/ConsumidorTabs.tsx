import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { color, typography } from '../theme/tokens';
import { ExplorarOfertasScreen } from '../screens/consumidor/ExplorarOfertasScreen';
import { MisReservasScreen } from '../screens/consumidor/MisReservasScreen';

export type ConsumidorTabParamList = {
  Explorar: undefined;
  MisReservas: undefined;
};

const Tab = createBottomTabNavigator<ConsumidorTabParamList>();

export function ConsumidorTabs() {
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
        name="Explorar"
        component={ExplorarOfertasScreen}
        options={{
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ color: iconColor, size }) => (
            <Ionicons name="search" size={size} color={iconColor} />
          ),
        }}
      />
      <Tab.Screen
        name="MisReservas"
        component={MisReservasScreen}
        options={{
          tabBarLabel: 'Mis Reservas',
          tabBarIcon: ({ color: iconColor, size }) => (
            <Ionicons name="basket" size={size} color={iconColor} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}