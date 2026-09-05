import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConsumidorTabs } from './ConsumidorTabs';
import { DetalleOfertaScreen } from '../screens/consumidor/DetalleOfertaScreen';
import type { ConsumidorStackParamList } from './types';

const Stack = createNativeStackNavigator<ConsumidorStackParamList>();

export function ConsumidorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConsumidorTabs" component={ConsumidorTabs} />
      <Stack.Screen name="DetalleOferta" component={DetalleOfertaScreen} />
    </Stack.Navigator>
  );
}