import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';

import { CategoryFilterChips } from '@/components/CategoryFilterChips';
import { es } from '@/i18n/es';
import { useEcoStore } from '@/store/useEcoStore';
import { colors } from '@/theme/colors';
import { radius, spacing, MIN_TAP_TARGET } from '@/theme/spacing';
import type { Categoria } from '@/types';

export default function ReportScreen() {
  const addSugerencia = useEcoStore((s) => s.addSugerencia);

  const [nombre, setNombre] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [direccion, setDireccion] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);

  function alternarCategoria(categoria: Categoria) {
    setCategorias((actual) =>
      actual.includes(categoria)
        ? actual.filter((c) => c !== categoria)
        : [...actual, categoria],
    );
  }

  async function usarMiUbicacion() {
    setLocalizando(true);
    setErrores([]);
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (permiso.status !== 'granted') {
        setErrores([es.report.errors.location]);
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        lat: posicion.coords.latitude,
        lng: posicion.coords.longitude,
      });
    } catch {
      setErrores([es.report.errors.location]);
    } finally {
      setLocalizando(false);
    }
  }

  async function elegirFoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });
    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  }

  async function tomarFoto() {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });
    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  }

  function enviar() {
    const nuevosErrores: string[] = [];
    const nombreLimpio = nombre.trim();
    if (nombreLimpio.length < 3 || nombreLimpio.length > 80) {
      nuevosErrores.push(es.report.errors.name);
    }
    if (categorias.length === 0) {
      nuevosErrores.push(es.report.errors.categories);
    }
    if (!coords) {
      nuevosErrores.push(es.report.errors.location);
    }

    setErrores(nuevosErrores);
    if (nuevosErrores.length > 0) return;

    addSugerencia({
      nombre: nombreLimpio,
      categorias,
      direccion: direccion.trim() || undefined,
      lat: coords!.lat,
      lng: coords!.lng,
      fotoUri: fotoUri ?? undefined,
    });
    setEnviado(true);
  }

  if (enviado) {
    return (
      <View style={styles.confirmacion}>
        <Text style={styles.confirmacionEmoji}>🎉</Text>
        <Text style={styles.confirmacionTitulo}>{es.report.success}</Text>
        <Text style={styles.confirmacionTexto}>{es.report.successMessage}</Text>
        <Pressable
          onPress={() => router.push('/')}
          style={styles.botonPrincipal}
          accessibilityRole="button"
          accessibilityLabel={es.report.backHome}
        >
          <Text style={styles.botonPrincipalTexto}>{es.report.backHome}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.subtitulo}>{es.report.subtitle}</Text>

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>{es.report.name}</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder={es.report.namePlaceholder}
          placeholderTextColor={colors.textMuted}
          maxLength={80}
          style={styles.input}
          accessibilityLabel={es.report.name}
        />
      </View>

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>{es.report.categories}</Text>
        <CategoryFilterChips
          seleccionadas={categorias}
          onToggle={alternarCategoria}
        />
      </View>

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>{es.report.address}</Text>
        <TextInput
          value={direccion}
          onChangeText={setDireccion}
          placeholder={es.report.addressPlaceholder}
          placeholderTextColor={colors.textMuted}
          maxLength={150}
          multiline
          style={[styles.input, styles.inputMultiline]}
          accessibilityLabel={es.report.address}
        />
      </View>

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>{es.report.location}</Text>
        {coords ? (
          <Text style={styles.coords}>
            ✓ {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </Text>
        ) : (
          <Pressable
            onPress={usarMiUbicacion}
            disabled={localizando}
            style={styles.botonUbicacion}
            accessibilityRole="button"
            accessibilityLabel={es.report.useMyLocation}
          >
            {localizando ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text style={styles.botonUbicacionTexto}>
                {es.report.useMyLocation}
              </Text>
            )}
          </Pressable>
        )}
      </View>

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>{es.report.photo}</Text>
        {fotoUri ? (
          <View style={styles.fotoContenedor}>
            <Image source={{ uri: fotoUri }} style={styles.foto} />
            <Pressable
              onPress={() => setFotoUri(null)}
              style={styles.botonQuitar}
              accessibilityRole="button"
              accessibilityLabel={es.report.removePhoto}
            >
              <Text style={styles.botonQuitarTexto}>{es.report.removePhoto}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.botonesFoto}>
            <Pressable
              onPress={tomarFoto}
              style={styles.botonFoto}
              accessibilityRole="button"
              accessibilityLabel={es.report.takePhoto}
            >
              <Text style={styles.botonFotoTexto}>{es.report.takePhoto}</Text>
            </Pressable>
            <Pressable
              onPress={elegirFoto}
              style={styles.botonFoto}
              accessibilityRole="button"
              accessibilityLabel={es.report.chooseFromGallery}
            >
              <Text style={styles.botonFotoTexto}>
                {es.report.chooseFromGallery}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {errores.length > 0 && (
        <View style={styles.errores}>
          {errores.map((error) => (
            <Text key={error} style={styles.errorTexto}>
              • {error}
            </Text>
          ))}
        </View>
      )}

      <Pressable
        onPress={enviar}
        style={styles.botonPrincipal}
        accessibilityRole="button"
        accessibilityLabel={es.report.submit}
      >
        <Text style={styles.botonPrincipalTexto}>{es.report.submit}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenido: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.textMuted,
  },
  seccion: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  coords: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  botonUbicacion: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonUbicacionTexto: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  botonesFoto: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  botonFoto: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonFotoTexto: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  fotoContenedor: {
    gap: spacing.sm,
  },
  foto: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  botonQuitar: {
    alignSelf: 'flex-start',
  },
  botonQuitarTexto: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  errores: {
    backgroundColor: '#FDECEA',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  errorTexto: {
    color: colors.danger,
    fontSize: 14,
  },
  botonPrincipal: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  botonPrincipalTexto: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  confirmacion: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  confirmacionEmoji: {
    fontSize: 48,
  },
  confirmacionTitulo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  confirmacionTexto: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
