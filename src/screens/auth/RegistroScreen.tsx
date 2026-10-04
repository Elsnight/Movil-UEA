import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
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

const registroSchema = z.object({
  nombres: z.string().min(1, 'Los nombres son obligatorios').transform((v) => v.trim()),
  apellidos: z.string().min(1, 'Los apellidos son obligatorios').transform((v) => v.trim()),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Debe contener al menos una letra')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmarPassword: z.string(),
  rol: z.enum(['CONSUMIDOR', 'COMERCIANTE']),
}).refine((data) => data.password === data.confirmarPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarPassword'],
});

type RegistroFormData = z.infer<typeof registroSchema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'Registro'>;

const ROLES = ['CONSUMIDOR', 'COMERCIANTE'] as const;

const ROL_CONFIG = {
  CONSUMIDOR: { label: 'Consumidor', icon: 'person' as const, desc: 'Quiero comprar comida a precio reducido' },
  COMERCIANTE: { label: 'Comerciante', icon: 'storefront' as const, desc: 'Tengo un comercio y quiero publicar ofertas' },
};

export function RegistroScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const setSesion = useAuthStore((s) => s.setSesion);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: { nombres: '', apellidos: '', email: '', password: '', confirmarPassword: '', rol: 'CONSUMIDOR' },
  });

  const selectedRol = watch('rol');

  const onSubmit = async (data: RegistroFormData) => {
    setLoading(true);
    setError('');
    try {
      const { data: sesion } = await authService.registro({
        email: data.email,
        password: data.password,
        nombres: data.nombres,
        apellidos: data.apellidos,
        rol: data.rol,
      });
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
          : 'Error al registrarse. Intenta de nuevo.';
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ marginBottom: spacing.md, alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={color.textPrimary} />
        </TouchableOpacity>

        <Text
          style={[typography.heading, { color: color.textPrimary, marginBottom: spacing.xs }]}
          accessibilityRole="header"
        >
          Crear cuenta
        </Text>
        <Text style={[typography.body, { color: color.textSecondary, marginBottom: spacing.lg }]}>
          Únete a RescateFresco
        </Text>

        {error ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: '#FFEBEE',
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
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>
            Nombres
          </Text>
          <Controller
            control={control}
            name="nombres"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Tus nombres"
                placeholderTextColor={color.border}
                autoCapitalize="words"
                autoComplete="name"
                accessibilityLabel="Nombres"
                style={{
                  backgroundColor: color.surface,
                  borderWidth: 1,
                  borderColor: errors.nombres ? color.danger : color.border,
                  borderRadius: radius.input,
                  paddingHorizontal: spacing.md,
                  height: 52,
                  fontSize: typography.body.fontSize,
                  color: color.textPrimary,
                }}
              />
            )}
          />
          {errors.nombres && (
            <Text style={[typography.caption, { color: color.danger, marginTop: spacing.xs }]}>
              {errors.nombres.message}
            </Text>
          )}
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>
            Apellidos
          </Text>
          <Controller
            control={control}
            name="apellidos"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Tus apellidos"
                placeholderTextColor={color.border}
                autoCapitalize="words"
                autoComplete="family-name"
                accessibilityLabel="Apellidos"
                style={{
                  backgroundColor: color.surface,
                  borderWidth: 1,
                  borderColor: errors.apellidos ? color.danger : color.border,
                  borderRadius: radius.input,
                  paddingHorizontal: spacing.md,
                  height: 52,
                  fontSize: typography.body.fontSize,
                  color: color.textPrimary,
                }}
              />
            )}
          />
          {errors.apellidos && (
            <Text style={[typography.caption, { color: color.danger, marginTop: spacing.xs }]}>
              {errors.apellidos.message}
            </Text>
          )}
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>
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
            <Text style={[typography.caption, { color: color.danger, marginTop: spacing.xs }]}>
              {errors.email.message}
            </Text>
          )}
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>
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
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={color.border}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
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
            <Text style={[typography.caption, { color: color.danger, marginTop: spacing.xs }]}>
              {errors.password.message}
            </Text>
          )}
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>
            Confirmar contraseña
          </Text>
          <Controller
            control={control}
            name="confirmarPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Repite la contraseña"
                placeholderTextColor={color.border}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                accessibilityLabel="Confirmar contraseña"
                style={{
                  backgroundColor: color.surface,
                  borderWidth: 1,
                  borderColor: errors.confirmarPassword ? color.danger : color.border,
                  borderRadius: radius.input,
                  paddingHorizontal: spacing.md,
                  height: 52,
                  fontSize: typography.body.fontSize,
                  color: color.textPrimary,
                }}
              />
            )}
          />
          {errors.confirmarPassword && (
            <Text style={[typography.caption, { color: color.danger, marginTop: spacing.xs }]}>
              {errors.confirmarPassword.message}
            </Text>
          )}
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.sm }]}>
            Tipo de cuenta
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {ROLES.map((rol) => {
              const selected = selectedRol === rol;
              const cfg = ROL_CONFIG[rol];
              return (
                <Pressable
                  key={rol}
                  onPress={() => setValue('rol', rol, { shouldValidate: true })}
                  accessibilityRole="radio"
                  accessibilityLabel={cfg.label}
                  accessibilityState={{ selected }}
                  style={{
                    flex: 1,
                    padding: spacing.md,
                    borderRadius: radius.card,
                    borderWidth: 2,
                    borderColor: selected ? color.primary : color.border,
                    backgroundColor: selected ? color.primaryLight : color.surface,
                    alignItems: 'center',
                    gap: spacing.sm,
                    minHeight: 100,
                  }}
                >
                  <Ionicons
                    name={cfg.icon}
                    size={28}
                    color={selected ? color.primary : color.textSecondary}
                  />
                  <Text
                    style={[
                      typography.body,
                      { color: selected ? color.primary : color.textPrimary, fontWeight: '600' },
                    ]}
                  >
                    {cfg.label}
                  </Text>
                  <Text
                    style={[typography.caption, { color: color.textSecondary, textAlign: 'center' }]}
                  >
                    {cfg.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.rol && (
            <Text style={[typography.caption, { color: color.danger, marginTop: spacing.xs }]}>
              {errors.rol.message}
            </Text>
          )}
        </View>

        <Button
          label="Crear cuenta"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
          size="lg"
          accessibilityLabel="Crear cuenta"
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="button"
          accessibilityLabel="Volver a inicio de sesión"
          style={{
            alignItems: 'center',
            paddingVertical: spacing.md,
            marginTop: spacing.md,
            minHeight: 44,
            justifyContent: 'center',
          }}
        >
          <Text style={[typography.body, { color: color.textSecondary }]}>
            ¿Ya tienes cuenta?{' '}
            <Text style={{ color: color.primary, fontWeight: '600' }}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}