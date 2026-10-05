import { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../services/api';
import { color, spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/Button/Button';
import { comerciosService, type ComercioMio } from '../../services/comerciosService';
import { productosService, type Categoria } from '../../services/productosService';

type Paso = 'COMERCIO' | 'SUCURSAL' | 'PRODUCTO' | 'LISTO';

export function GestionarScreen() {
  const insets = useSafeAreaInsets();
  const [paso, setPaso] = useState<Paso>('COMERCIO');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [comercioId, setComercioId] = useState('');

  const [cRuc, setCRuc] = useState('');
  const [cRazon, setCRazon] = useState('');
  const [cNombre, setCNombre] = useState('');
  const [cCorreo, setCCorreo] = useState('');

  const [sNombre, setSNombre] = useState('');
  const [sDireccion, setSDireccion] = useState('');
  const [sCiudad, setSCiudad] = useState('Quito');
  const [sLat, setSLat] = useState('-0.18');
  const [sLon, setSLon] = useState('-78.46');
  const [sTel, setSTel] = useState('');

  const [comercios, setComercios] = useState<ComercioMio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pComercioId, setPComercioId] = useState('');
  const [pCategoriaId, setPCategoriaId] = useState<number | null>(null);
  const [pNombre, setPNombre] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pAlerg, setPAlerg] = useState('');
  const [pImgUrl, setPImgUrl] = useState('');
  const [pActivo, setPActivo] = useState(true);

  useEffect(() => {
    let activo = true;
    void (async () => {
      try {
        const [cr, cat] = await Promise.all([
          comerciosService.mios(),
          productosService.categorias(),
        ]);
        if (!activo) return;
        setComercios(cr.data);
        setCategorias(cat.data);
      } catch { /* ignore */ }
    })();
    return () => { activo = false; };
  }, []);

  async function crearComercio() {
    setError('');
    if (!cRuc.trim() || !cRazon.trim() || !cNombre.trim() || !cCorreo.trim()) {
      setError('Completa todos los campos del comercio.'); return;
    }
    setEnviando(true);
    try {
      const res = await comerciosService.crear({
        ruc: cRuc.trim(), razon_social: cRazon.trim(),
        nombre_comercial: cNombre.trim(), correo_contacto: cCorreo.trim(),
      });
      setComercioId(res.data.comercio_id);
      setPaso('SUCURSAL');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al crear comercio.');
    } finally { setEnviando(false); }
  }

  async function crearSucursal() {
    setError('');
    if (!sNombre.trim() || !sDireccion.trim() || !sCiudad.trim()) {
      setError('Nombre, dirección y ciudad obligatorios.'); return;
    }
    setEnviando(true);
    try {
      await comerciosService.agregarSucursal(comercioId, {
        nombre: sNombre.trim(), direccion: sDireccion.trim(),
        ciudad: sCiudad.trim(), latitud: parseFloat(sLat),
        longitud: parseFloat(sLon), telefono: sTel.trim() || undefined,
      });
      setPaso('PRODUCTO');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al crear sucursal.');
    } finally { setEnviando(false); }
  }

  async function crearProducto() {
    setError('');
    if (!pComercioId || !pCategoriaId || !pNombre.trim()) {
      setError('Selecciona comercio, categoría y nombre del producto.'); return;
    }
    setEnviando(true);
    try {
      await productosService.crear({
        comercio_id: pComercioId, categoria_id: pCategoriaId,
        nombre: pNombre.trim(), descripcion: pDesc.trim() || undefined,
        informacion_alergenos: pAlerg.trim() || undefined,
        imagen_url: pImgUrl.trim() || undefined, activo: pActivo,
      });
      setPaso('LISTO');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al crear producto.');
    } finally { setEnviando(false); }
  }

  const volver = () => {
    setError('');
    if (paso === 'SUCURSAL') setPaso('COMERCIO');
    else if (paso === 'PRODUCTO') setPaso('SUCURSAL');
    else setPaso('COMERCIO');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.md, paddingBottom: insets.bottom + spacing.lg }}>
        <Text style={[typography.heading, { color: color.textPrimary, marginBottom: spacing.xs }]}>
          {paso === 'COMERCIO' ? 'Crear comercio' : paso === 'SUCURSAL' ? 'Agregar sucursal' : paso === 'PRODUCTO' ? 'Crear producto' : '¡Listo!'}
        </Text>
        {error ? <View style={{ backgroundColor: color.dangerLight, padding: spacing.sm, borderRadius: radius.input, marginBottom: spacing.sm }}><Text style={[typography.caption, { color: color.danger }]}>{error}</Text></View> : null}

        {paso === 'LISTO' ? (
          <View style={{ backgroundColor: color.successLightest, padding: spacing.xl, borderRadius: radius.card, gap: spacing.md, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={48} color={color.success} />
            <Text style={[typography.body, { color: color.success, textAlign: 'center' }]}>
              Comercio creado, sucursal agregada y producto creado. Ahora podés publicar ofertas.
            </Text>
          </View>
        ) : paso === 'COMERCIO' ? (<>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>RUC</Text>
          <TextInput value={cRuc} onChangeText={setCRuc} placeholder="1790012345001" placeholderTextColor={color.border} accessibilityLabel="RUC"
            style={inputStyle} />
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Razón social</Text>
          <TextInput value={cRazon} onChangeText={setCRazon} placeholder="Nombre legal" placeholderTextColor={color.border} accessibilityLabel="Razón social"
            style={inputStyle} />
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Nombre comercial</Text>
          <TextInput value={cNombre} onChangeText={setCNombre} placeholder="Mi Tienda" placeholderTextColor={color.border} accessibilityLabel="Nombre comercial"
            style={inputStyle} />
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Correo de contacto</Text>
          <TextInput value={cCorreo} onChangeText={setCCorreo} placeholder="tienda@mail.com" placeholderTextColor={color.border} keyboardType="email-address" accessibilityLabel="Correo"
            style={inputStyle} />
          <Button label="Crear comercio" onPress={() => void crearComercio()} loading={enviando} disabled={enviando} size="lg" />
        </>) : paso === 'SUCURSAL' ? (<>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Nombre de sucursal</Text>
          <TextInput value={sNombre} onChangeText={setSNombre} placeholder="Centro" placeholderTextColor={color.border} accessibilityLabel="Nombre sucursal" style={inputStyle} />
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Dirección</Text>
          <TextInput value={sDireccion} onChangeText={setSDireccion} placeholder="Av. Principal" placeholderTextColor={color.border} accessibilityLabel="Dirección" style={inputStyle} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Ciudad</Text>
              <TextInput value={sCiudad} onChangeText={setSCiudad} accessibilityLabel="Ciudad" style={inputStyle} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Teléfono</Text>
              <TextInput value={sTel} onChangeText={setSTel} accessibilityLabel="Teléfono" keyboardType="phone-pad" style={inputStyle} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Latitud</Text>
              <TextInput value={sLat} onChangeText={setSLat} accessibilityLabel="Latitud" keyboardType="numeric" style={inputStyle} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Longitud</Text>
              <TextInput value={sLon} onChangeText={setSLon} accessibilityLabel="Longitud" keyboardType="numeric" style={inputStyle} />
            </View>
          </View>
          <Button label="Agregar sucursal" onPress={() => void crearSucursal()} loading={enviando} disabled={enviando} size="lg" />
        </>) : (<>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Comercio</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
            {comercios.map((c) => (
              <Pressable key={c.comercio_id} onPress={() => setPComercioId(c.comercio_id)}
                style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.badge,
                  backgroundColor: pComercioId === c.comercio_id ? color.primary : color.surface, borderWidth: 1,
                  borderColor: pComercioId === c.comercio_id ? color.primary : color.border }}>
                <Text style={[typography.caption, { color: pComercioId === c.comercio_id ? color.surface : color.textPrimary }]}>{c.nombre_comercial}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Categoría</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm }}>
            {categorias.map((cat) => (
              <Pressable key={cat.categoria_id} onPress={() => setPCategoriaId(cat.categoria_id)}
                style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.badge,
                  backgroundColor: pCategoriaId === cat.categoria_id ? color.primary : color.surface, borderWidth: 1,
                  borderColor: pCategoriaId === cat.categoria_id ? color.primary : color.border }}>
                <Text style={[typography.caption, { color: pCategoriaId === cat.categoria_id ? color.surface : color.textPrimary }]}>{cat.nombre}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Nombre del producto</Text>
          <TextInput value={pNombre} onChangeText={setPNombre} accessibilityLabel="Nombre producto" style={inputStyle} />
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Descripción</Text>
          <TextInput value={pDesc} onChangeText={setPDesc} accessibilityLabel="Descripción" style={{ ...inputStyle, height: 80 }} numberOfLines={3} />
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Alérgenos</Text>
          <TextInput value={pAlerg} onChangeText={setPAlerg} accessibilityLabel="Alérgenos" style={inputStyle} />
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>URL de imagen</Text>
          <TextInput value={pImgUrl} onChangeText={setPImgUrl} placeholder="https://..." placeholderTextColor={color.border} accessibilityLabel="URL imagen" style={inputStyle} />
          <Text style={[typography.caption, { color: color.textSecondary, marginBottom: spacing.xs }]}>Activo</Text>
          <Pressable onPress={() => setPActivo(!pActivo)}
            style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.badge,
              backgroundColor: pActivo ? color.successLight : color.neutralLight, alignItems: 'center' }}>
            <Text style={[typography.body, { color: pActivo ? color.success : color.textSecondary }]}>{pActivo ? 'Sí' : 'No'}</Text>
          </Pressable>
          <Button label="Crear producto" onPress={() => void crearProducto()} loading={enviando} disabled={enviando} size="lg" />
        </>)}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  backgroundColor: color.surface,
  borderWidth: 1,
  borderColor: color.border,
  borderRadius: radius.input,
  paddingHorizontal: spacing.md,
  height: 52,
  fontSize: typography.body.fontSize,
  color: color.textPrimary,
  marginBottom: spacing.md,
};