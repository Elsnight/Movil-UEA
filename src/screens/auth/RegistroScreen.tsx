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
import { color, spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/Button/Button';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

const registroSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rol: z.enum(['CONSUMIDOR', 'COMERCIANTE']),
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
    defaultValues: { nombre: '', email: '', password: '', rol: 'CONSUMIDOR' },
  });

  const selectedRol = watch('rol');

  const onSubmit = async (data: RegistroFormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await authService.registro(data);
      await setSesion(
        res.token,
        res.refreshToken,
        res.usuario as {
          id: string;
          email: string;
          nombre: string;
          rol: 'CONSUMIDOR' | 'COMERCIANTE' | 'ADMINISTRADOR';
        },
      );
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { mensaje?: string } } })?.response?.data
          ?.mensaje ?? 'Error al registrarse. Intenta de nuevo.';
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
            Nombre
          </Text>
          <Controller
            control={control}
            name="nombre"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Tu nombre"
                placeholderTextColor={color.border}
                autoCapitalize="words"
                autoComplete="name"
                accessibilityLabel="Nombre"
                style={{
                  backgroundColor: color.surface,
                  borderWidth: 1,
                  borderColor: errors.nombre ? color.danger : color.border,
                  borderRadius: radius.input,
                  paddingHorizontal: spacing.md,
                  height: 52,
                  fontSize: typography.body.fontSize,
                  color: color.textPrimary,
                }}
              />
            )}
          />
          {errors.nombre && (
            <Text style={[typography.caption, { color: color.danger, marginTop: spacing.xs }]}>
              {errors.nombre.message}
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