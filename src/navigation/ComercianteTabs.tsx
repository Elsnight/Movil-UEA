import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { color, typography } from '../theme/tokens';
import { MisOfertasScreen } from '../screens/comerciante/MisOfertasScreen';
import { PublicarOfertaScreen } from '../screens/comerciante/PublicarOfertaScreen';
import { ValidarRetiroScreen } from '../screens/comerciante/ValidarRetiroScreen';

export type ComercianteTabParamList = {
  MisOfertas: undefined;
  Publicar: undefined;
  ValidarRetiro: undefined;
};

const Tab = createBottomTabNavigator<ComercianteTabParamList>();

export function ComercianteTabs() {
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
        name="MisOfertas"
        component={MisOfertasScreen}
        options={{
          tabBarLabel: 'Mis Ofertas',
          tabBarIcon: ({ color: iconColor, size }) => (
            <Ionicons name="pricetags" size={size} color={iconColor} />
          ),
        }}
      />
      <Tab.Screen
        name="Publicar"
        component={PublicarOfertaScreen}
        options={{
          tabBarLabel: 'Publicar',
          tabBarIcon: ({ color: iconColor, size }) => (
            <Ionicons name="add-circle" size={size} color={iconColor} />
          ),
        }}
      />
      <Tab.Screen
        name="ValidarRetiro"
        component={ValidarRetiroScreen}
        options={{
          tabBarLabel: 'Validar',
          tabBarIcon: ({ color: iconColor, size }) => (
            <Ionicons name="scan" size={size} color={iconColor} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}