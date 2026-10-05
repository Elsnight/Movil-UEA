import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../services/api';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/Button/Button';
import { retirosService } from '../../services/retirosService';

export function ValidarRetiroScreen() {
  const insets = useSafeAreaInsets();
  const [codigo, setCodigo] = useState('');
  const [metodo, setMetodo] = useState<'QR' | 'CODIGO_MANUAL'>('CODIGO_MANUAL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<unknown>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleValidar() {
    setError('');
    setSuccess(null);
    if (!codigo.trim()) { setError('Ingresa el código de retiro.'); return; }
    setEnviando(true);
    try {
      const res = await retirosService.validar({ codigo_retiro: codigo.trim().toUpperCase(), metodo_validacion: metodo });
      setSuccess(res.data);
      setCodigo('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al validar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.md, paddingBottom: insets.bottom + spacing.lg }} keyboardShouldPersistTaps="handled">
        {error ? <View style={{ backgroundColor: color.dangerLight, padding: spacing.sm, borderRadius: radius.input, marginBottom: spacing.sm }}><Text style={[typography.caption, { color: color.danger }]}>{error}</Text></View> : null}
        {success ? (
          <View style={{ backgroundColor: color.successLight, padding: spacing.md, borderRadius: radius.card, marginBottom: spacing.sm, gap: spacing.xs }}>
            <Ionicons name="checkmark-circle" size={28} color={color.success} />
            <Text style={[typography.body, { color: color.success }]}>Retiro validado correctamente</Text>
          </View>
        ) : null}

        <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Método de validación</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
          {(['CODIGO_MANUAL', 'QR'] as const).map((m) => (
            <Pressable key={m} onPress={() => setMetodo(m)}
              accessibilityRole="button" accessibilityLabel={m}
              style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.badge,
                backgroundColor: metodo === m ? color.primary : color.surface, borderWidth: 1,
                borderColor: metodo === m ? color.primary : color.border }}>
              <Text style={[typography.caption, { color: metodo === m ? color.surface : color.textPrimary }]}>{m === 'CODIGO_MANUAL' ? 'Código manual' : 'QR'}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Código de retiro</Text>
        <TextInput value={codigo} onChangeText={setCodigo} placeholder="A2BC3D4E" placeholderTextColor={color.border}
          autoCapitalize="characters" accessibilityLabel="Código de retiro"
          style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border,
            borderRadius: radius.input, paddingHorizontal: spacing.md, height: 52, fontSize: 24,
            letterSpacing: 4, color: color.textPrimary, marginBottom: spacing.md }} />

        <Button label="Validar retiro" onPress={() => void handleValidar()} loading={enviando} disabled={enviando} size="lg" accessibilityLabel="Validar código de retiro" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}