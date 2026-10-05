import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList } from '../../navigation/types';
import { ApiError } from '../../services/api';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/Button/Button';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const setSesion = useAuthStore.getState().setSesion;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      const { data: sesion } = await authService.login(data);
      await setSesion(
        sesion.token,
        sesion.refreshToken,
        sesion.usuario as {
          id: string;
          email: string;
          nombre: string;
          rol: 'CONSUMIDOR' | 'COMERCIANTE' | 'ADMINISTRADOR';
        },
      );
    } catch (e: unknown) {
      const msg =
        e instanceof ApiError
          ? e.message
          : 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: color.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Ionicons name="basket" size={64} color={color.primary} />
          <Text
            style={[typography.display, { color: color.textPrimary, marginTop: spacing.md }]}
            accessibilityRole="header"
          >
            RescateFresco
          </Text>
          <Text
            style={[typography.body, { color: color.textSecondary, marginTop: spacing.xs }]}
          >
            Comida fresca, precio justo
          </Text>
        </View>

        {error ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: color.dangerLight,
              padding: spacing.md,
              borderRadius: radius.input,
              marginBottom: spacing.md,
            }}
            accessibilityRole="alert"
          >
            <Ionicons name="alert-circle" size={20} color={color.danger} />
            <Text style={[typography.body, { color: color.danger, flex: 1 }]}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={[
              typography.caption,
              { color: color.textSecondary, marginBottom: spacing.xs },
            ]}
          >
            Correo electrónico
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={color.border}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Correo electrónico"
                style={{
                  backgroundColor: color.surface,
                  borderWidth: 1,
                  borderColor: errors.email ? color.danger : color.border,
                  borderRadius: radius.input,
                  paddingHorizontal: spacing.md,
                  height: 52,
                  fontSize: typography.body.fontSize,
                  color: color.textPrimary,
                }}
              />
            )}
          />
          {errors.email && (
            <Text
              style={[typography.caption, { color: color.danger, marginTop: spacing.xs }]}
            >
              {errors.email.message}
            </Text>
          )}
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={[
              typography.caption,
              { color: color.textSecondary, marginBottom: spacing.xs },
            ]}
          >
            Contraseña
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                placeholderTextColor={color.border}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                accessibilityLabel="Contraseña"
                style={{
                  backgroundColor: color.surface,
                  borderWidth: 1,
                  borderColor: errors.password ? color.danger : color.border,
                  borderRadius: radius.input,
                  paddingHorizontal: spacing.md,
                  height: 52,
                  fontSize: typography.body.fontSize,
                  color: color.textPrimary,
                }}
              />
            )}
          />
          {errors.password && (
            <Text
              style={[typography.caption, { color: color.danger, marginTop: spacing.xs }]}
            >
              {errors.password.message}
            </Text>
          )}
        </View>

        <Button
          label="Iniciar sesión"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
          size="lg"
          accessibilityLabel="Iniciar sesión"
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Registro')}
          accessibilityRole="button"
          accessibilityLabel="Crear una cuenta nueva"
          style={{
            alignItems: 'center',
            paddingVertical: spacing.md,
            marginTop: spacing.md,
            minHeight: 44,
            justifyContent: 'center',
          }}
        >
          <Text style={[typography.body, { color: color.textSecondary }]}>
            ¿No tienes cuenta?{' '}
            <Text style={{ color: color.primary, fontWeight: '600' }}>
              Regístrate
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}