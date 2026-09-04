import { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {children}
    </SafeAreaProvider>
  );
}