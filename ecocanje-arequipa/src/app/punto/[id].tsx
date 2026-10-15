import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { VerificationBadge } from '@/components/VerificationBadge';
import { buscarPunto } from '@/data';
import { es } from '@/i18n/es';
import { useEcoStore } from '@/store/useEcoStore';
import { colors } from '@/theme/colors';
import { radius, spacing, MIN_TAP_TARGET } from '@/theme/spacing';
import { CATEGORIA_LABEL, CATEGORIA_COLOR } from '@/utils/categories';
import { llamar, openRoute } from '@/utils/openRoute';

const TIPO_LABEL: Record<string, string> = {
  planta_municipal: 'Planta municipal',
  empresa_recicladora: 'Empresa recicladora',
  punto_raee_corporativo: 'Punto RAEE corporativo',
  entidad_publica: 'Entidad pública',
  centro_acopio_municipal: 'Centro de acopio municipal',
};

export default function PointDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const punto = buscarPunto(id ?? '');
  const addAporte = useEcoStore((s) => s.addAporte);

  if (!punto) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.noEncontrado}>Punto no encontrado.</Text>
      </View>
    );
  }

  function registrarAporte() {
    addAporte(punto!.id);
    Alert.alert(es.detail.contributed);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: punto.nombre }} />

      <View style={styles.encabezado}>
        <Text style={styles.nombre}>{punto.nombre}</Text>
        <Text style={styles.tipo}>
          {TIPO_LABEL[punto.tipo] ?? punto.tipo} · {punto.distrito}
        </Text>
        <VerificationBadge estado={punto.verificacion} />
      </View>

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>{es.detail.accepted}</Text>
        <View style={styles.chips}>
          {punto.categorias_aceptadas.map((categoria) => (
            <View
              key={categoria}
              style={[
                styles.chip,
                { backgroundColor: `${CATEGORIA_COLOR[categoria]}22` },
              ]}
            >
              <Text style={[styles.chipTexto, { color: CATEGORIA_COLOR[categoria] }]}>
                {CATEGORIA_LABEL[categoria]}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.cuerpo}>{punto.detalle_residuos}</Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>Dirección</Text>
        <Text style={styles.cuerpo}>{punto.direccion}</Text>
      </View>

      <View style={styles.seccion}>
        <Text style={styles.etiqueta}>{es.detail.hours}</Text>
        <Text style={styles.cuerpo}>{punto.horario ?? es.detail.hoursUnknown}</Text>
      </View>

      {punto.telefono && (
        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>Teléfono</Text>
          <Text style={styles.cuerpo}>{punto.telefono}</Text>
          <Pressable
            onPress={() => llamar(punto.telefono!)}
            style={styles.botonSecundario}
            accessibilityRole="button"
            accessibilityLabel={es.detail.call}
          >
            <Text style={styles.botonSecundarioTexto}>{es.detail.call}</Text>
          </Pressable>
        </View>
      )}

      {punto.notas && (
        <View style={styles.seccion}>
          <Text style={styles.etiqueta}>{es.detail.notes}</Text>
          <Text style={styles.cuerpo}>{punto.notas}</Text>
        </View>
      )}

      <Pressable
        onPress={() => openRoute(punto.lat, punto.lng, punto.google_place_id)}
        style={styles.botonPrincipal}
        accessibilityRole="button"
        accessibilityLabel={es.detail.route}
      >
        <Text style={styles.botonPrincipalTexto}>{es.detail.route}</Text>
      </Pressable>

      <Pressable
        onPress={registrarAporte}
        style={styles.botonAporte}
        accessibilityRole="button"
        accessibilityLabel={es.detail.contribute}
      >
        <Text style={styles.botonAporteTexto}>{es.detail.contribute}</Text>
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
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  noEncontrado: {
    fontSize: 16,
    color: colors.textMuted,
  },
  encabezado: {
    gap: spacing.xs,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  tipo: {
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
  cuerpo: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  botonPrincipal: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    minHeight: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  botonPrincipalTexto: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  botonSecundario: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSecundarioTexto: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  botonAporte: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    minHeight: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  botonAporteTexto: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
  },
});
