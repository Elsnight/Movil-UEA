import { ReactNode } from 'react';
import { PressableProps } from 'react-native';

export interface ButtonProps {
  label: string;
  onPress: PressableProps['onPress'];
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  accessibilityLabel?: string;
  iconSlot?: ReactNode;
}