import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../services/api';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/Button/Button';
import { ofertasService } from '../../services/ofertasService';
import { comerciosService, type ComercioMio } from '../../services/comerciosService';
import { productosService, type ProductoPropio } from '../../services/productosService';

export function PublicarOfertaScreen() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [comercios, setComercios] = useState<ComercioMio[]>([]);
  const [productos, setProductos] = useState<ProductoPropio[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [comercioSel, setComercioSel] = useState('');
  const [sucursalSel, setSucursalSel] = useState('');
  const [productoSel, setProductoSel] = useState('');
  const [titulo, setTitulo] = useState('');
  const [precioOrig, setPrecioOrig] = useState('');
  const [precioOfer, setPrecioOfer] = useState('');
  const [stock, setStock] = useState('');
  const [fecVenc, setFecVenc] = useState('');
  const [retiroIni, setRetiroIni] = useState('');
  const [retiroFin, setRetiroFin] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const [cr, pr] = await Promise.all([
          comerciosService.mios(),
          productosService.mios(),
        ]);
        if (!activo) return;
        setComercios(cr.data);
        setProductos(pr.data);
      } catch (e) {
        if (!activo) return;
        setError(e instanceof ApiError ? e.message : 'Error al cargar datos.');
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  const sucursales = comercios
    .find((c) => c.comercio_id === comercioSel)
    ?.sucursales ?? [];

  async function handleSubmit() {
    setError('');
    setSuccess(false);
    if (!comercioSel || !sucursalSel || !productoSel || !titulo.trim()) {
      setError('Completa comercio, sucursal, producto y título.');
      return;
    }
    const po = parseFloat(precioOrig);
    const pf = parseFloat(precioOfer);
    const st = parseInt(stock, 10);
    if (po <= 0 || pf <= 0 || st <= 0) { setError('Precios y stock deben ser positivos.'); return; }
    if (pf >= po) { setError('El precio de oferta debe ser menor al original.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecVenc)) { setError('Fecha: YYYY-MM-DD'); return; }
    if (!/^\d{2}:\d{2}$/.test(retiroIni) || !/^\d{2}:\d{2}$/.test(retiroFin)) { setError('Horarios: HH:MM'); return; }

    const hoy = new Date().toISOString().slice(0, 10);
    setEnviando(true);
    try {
      await ofertasService.crear({
        producto_id: productoSel,
        sucursal_id: sucursalSel,
        titulo_publico: titulo.trim(),
        precio_original: po,
        precio_oferta: pf,
        stock_inicial: st,
        stock_disponible: st,
        fecha_vencimiento: `${fecVenc}T23:59:00Z`,
        inicio_retiro: `${hoy}T${retiroIni}:00Z`,
        fin_retiro: `${hoy}T${retiroFin}:00Z`,
      });
      setSuccess(true);
      setTitulo(''); setPrecioOrig(''); setPrecioOfer(''); setStock('');
      setFecVenc(''); setRetiroIni(''); setRetiroFin('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al publicar.');
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.background }}>
      <ActivityIndicator size="large" color={color.primary} />
    </View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.md, paddingBottom: insets.bottom + spacing.lg }} keyboardShouldPersistTaps="handled">
        {error ? <View style={{ backgroundColor: color.dangerLight, padding: spacing.sm, borderRadius: radius.input, marginBottom: spacing.sm }}><Text style={[typography.caption, { color: color.danger }]}>{error}</Text></View> : null}
        {success ? <View style={{ backgroundColor: color.successLight, padding: spacing.sm, borderRadius: radius.input, marginBottom: spacing.sm }}><Text style={[typography.caption, { color: color.success }]}>¡Oferta publicada!</Text></View> : null}

        <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Comercio</Text>
        {comercios.length === 0 ? <Text style={[typography.caption, { color: color.danger }]}>No tienes comercios. Créalo desde la API primero.</Text>
        : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
          {comercios.map((c) => (
            <Pressable key={c.comercio_id} onPress={() => { setComercioSel(c.comercio_id); setSucursalSel(''); }}
              accessibilityRole="button" accessibilityLabel={c.nombre_comercial}
              style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.badge,
                backgroundColor: comercioSel === c.comercio_id ? color.primary : color.surface,
                borderWidth: 1, borderColor: comercioSel === c.comercio_id ? color.primary : color.border }}>
              <Text style={[typography.caption, { color: comercioSel === c.comercio_id ? color.surface : color.textPrimary }]}>{c.nombre_comercial}</Text>
            </Pressable>
          ))}
        </View>}

        {sucursales.length > 0 ? <>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Sucursal</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
            {sucursales.map((s) => (
              <Pressable key={s.sucursal_id} onPress={() => setSucursalSel(s.sucursal_id)}
                accessibilityRole="button" accessibilityLabel={s.nombre}
                style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.badge,
                  backgroundColor: sucursalSel === s.sucursal_id ? color.primary : color.surface,
                  borderWidth: 1, borderColor: sucursalSel === s.sucursal_id ? color.primary : color.border }}>
                <Text style={[typography.caption, { color: sucursalSel === s.sucursal_id ? color.surface : color.textPrimary }]}>{s.nombre} — {s.direccion}</Text>
              </Pressable>
            ))}
          </View>
        </> : null}

        <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Producto</Text>
        {productos.length === 0 ? <Text style={[typography.caption, { color: color.danger }]}>No tienes productos.</Text>
        : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
          {productos.filter((p) => p.activo).map((p) => (
            <Pressable key={p.producto_id} onPress={() => setProductoSel(p.producto_id)}
              accessibilityRole="button" accessibilityLabel={p.nombre}
              style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.badge,
                backgroundColor: productoSel === p.producto_id ? color.primary : color.surface,
                borderWidth: 1, borderColor: productoSel === p.producto_id ? color.primary : color.border }}>
              <Text style={[typography.caption, { color: productoSel === p.producto_id ? color.surface : color.textPrimary }]}>{p.nombre}</Text>
            </Pressable>
          ))}
        </View>}

        <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Título</Text>
        <TextInput value={titulo} onChangeText={setTitulo} placeholder="Ej: Pan de yema - 6 uds" placeholderTextColor={color.border}
          accessibilityLabel="Título" style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border,
            borderRadius: radius.input, paddingHorizontal: spacing.md, height: 52, fontSize: typography.body.fontSize, color: color.textPrimary, marginBottom: spacing.md }} />

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Precio original</Text>
            <TextInput value={precioOrig} onChangeText={setPrecioOrig} placeholder="10.00" placeholderTextColor={color.border}
              keyboardType="numeric" accessibilityLabel="Precio original"
              style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border,
                borderRadius: radius.input, paddingHorizontal: spacing.md, height: 52, fontSize: typography.body.fontSize, color: color.textPrimary }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Precio oferta</Text>
            <TextInput value={precioOfer} onChangeText={setPrecioOfer} placeholder="5.00" placeholderTextColor={color.border}
              keyboardType="numeric" accessibilityLabel="Precio oferta"
              style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border,
                borderRadius: radius.input, paddingHorizontal: spacing.md, height: 52, fontSize: typography.body.fontSize, color: color.textPrimary }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Stock</Text>
            <TextInput value={stock} onChangeText={setStock} placeholder="10" placeholderTextColor={color.border}
              keyboardType="numeric" accessibilityLabel="Stock"
              style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border,
                borderRadius: radius.input, paddingHorizontal: spacing.md, height: 52, fontSize: typography.body.fontSize, color: color.textPrimary }} />
          </View>
        </View>

        <View style={{ height: spacing.md }} />
        <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Vencimiento (YYYY-MM-DD)</Text>
        <TextInput value={fecVenc} onChangeText={setFecVenc} placeholder="2026-10-06" placeholderTextColor={color.border}
          accessibilityLabel="Fecha vencimiento"
          style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border,
            borderRadius: radius.input, paddingHorizontal: spacing.md, height: 52, fontSize: typography.body.fontSize, color: color.textPrimary, marginBottom: spacing.sm }} />

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Retiro desde</Text>
            <TextInput value={retiroIni} onChangeText={setRetiroIni} placeholder="18:00" placeholderTextColor={color.border}
              accessibilityLabel="Inicio retiro"
              style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border,
                borderRadius: radius.input, paddingHorizontal: spacing.md, height: 52, fontSize: typography.body.fontSize, color: color.textPrimary }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Retiro hasta</Text>
            <TextInput value={retiroFin} onChangeText={setRetiroFin} placeholder="22:00" placeholderTextColor={color.border}
              accessibilityLabel="Fin retiro"
              style={{ backgroundColor: color.surface, borderWidth: 1, borderColor: color.border,
                borderRadius: radius.input, paddingHorizontal: spacing.md, height: 52, fontSize: typography.body.fontSize, color: color.textPrimary }} />
          </View>
        </View>

        <Button label="Publicar oferta" onPress={() => void handleSubmit()} loading={enviando} disabled={enviando} size="lg" accessibilityLabel="Publicar oferta" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}