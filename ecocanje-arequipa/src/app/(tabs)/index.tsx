import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Region } from 'react-native-maps';

import { router } from 'expo-router';

import { CategoryFilterChips } from '@/components/CategoryFilterChips';
import { EmptyState } from '@/components/EmptyState';
import { PointCard } from '@/components/PointCard';
import { PuntosMapa } from '@/components/PuntosMapa';
import { useFilteredPoints, type PuntoConDistancia } from '@/hooks/useFilteredPoints';
import { PLAZA_DE_ARMAS_AREQUIPA, useLocation } from '@/hooks/useLocation';
import { es } from '@/i18n/es';
import { colors } from '@/theme/colors';
import { radius, spacing, MIN_TAP_TARGET } from '@/theme/spacing';
import type { Categoria } from '@/types';

type Vista = 'mapa' | 'lista';

const REGION_INICIAL: Region = {
  latitude: PLAZA_DE_ARMAS_AREQUIPA.lat,
  longitude: PLAZA_DE_ARMAS_AREQUIPA.lng,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function HomeScreen() {
  const { coords, estado } = useLocation();
  const [vista, setVista] = useState<Vista>('mapa');
  const [seleccionadas, setSeleccionadas] = useState<Categoria[]>([]);
  const [region, setRegion] = useState<Region>(REGION_INICIAL);
  const [puntoSeleccionado, setPuntoSeleccionado] =
    useState<PuntoConDistancia | null>(null);

  const puntos = useFilteredPoints(seleccionadas, coords);

  useEffect(() => {
    if (estado === 'concedido') {
      setRegion({
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
    }
  }, [estado, coords]);

  function alternarCategoria(categoria: Categoria) {
    setSeleccionadas((actual) =>
      actual.includes(categoria)
        ? actual.filter((c) => c !== categoria)
        : [...actual, categoria],
    );
  }

  function irAlPunto(punto: PuntoConDistancia) {
    router.push({ pathname: '/punto/[id]', params: { id: punto.id } });
  }

  function centrarEnMiUbicacion() {
    setRegion({
      latitude: coords.lat,
      longitude: coords.lng,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>{es.home.title}</Text>
        <View style={styles.segmento}>
          {(['mapa', 'lista'] as Vista[]).map((opcion) => (
            <Pressable
              key={opcion}
              onPress={() => setVista(opcion)}
              accessibilityRole="button"
              accessibilityState={{ selected: vista === opcion }}
              style={[styles.segmentoOpcion, vista === opcion && styles.segmentoActivo]}
            >
              <Text
                style={[
                  styles.segmentoTexto,
                  vista === opcion && styles.segmentoTextoActivo,
                ]}
              >
                {opcion === 'mapa' ? es.home.viewMap : es.home.viewList}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <CategoryFilterChips
        seleccionadas={seleccionadas}
        onToggle={alternarCategoria}
      />

      {estado === 'cargando' && (
        <View style={styles.avisoCargando}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.avisoTexto}>{es.home.loading}</Text>
        </View>
      )}

      {estado === 'denegado' && (
        <View style={styles.avisoPermiso}>
          <Text style={styles.avisoTexto}>{es.home.permissionDenied}</Text>
        </View>
      )}

      {puntos.length === 0 ? (
        <EmptyState onSuggest={() => router.push('/reportar')} />
      ) : vista === 'mapa' ? (
        <View style={styles.mapaContenedor}>
          <PuntosMapa
            puntos={puntos}
            region={region}
            onPressMarker={(punto) => setPuntoSeleccionado(punto)}
          />
          <Pressable
            onPress={centrarEnMiUbicacion}
            style={styles.botonUbicacion}
            accessibilityRole="button"
            accessibilityLabel={es.home.myLocationLabel}
          >
            <Text style={styles.botonUbicacionTexto}>◎</Text>
          </Pressable>
          {puntoSeleccionado && (
            <Pressable
              onPress={() => irAlPunto(puntoSeleccionado)}
              style={styles.tarjetaMarcador}
              accessibilityRole="button"
            >
              <Text style={styles.tarjetaMarcadorNombre} numberOfLines={1}>
                {puntoSeleccionado.nombre}
              </Text>
              <Text style={styles.tarjetaMarcadorAccion}>Ver detalle ›</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={puntos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <PointCard punto={item} onPress={() => irAlPunto(item)} />
          )}
        />
      )}

      <Text style={styles.descargo}>{es.home.disclaimer}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  segmento: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
  },
  segmentoOpcion: {
    paddingHorizontal: spacing.lg,
    height: MIN_TAP_TARGET - 16,
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  segmentoActivo: {
    backgroundColor: colors.primary,
  },
  segmentoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segmentoTextoActivo: {
    color: colors.surface,
  },
  avisoCargando: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  avisoPermiso: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  avisoTexto: {
    fontSize: 13,
    color: colors.textMuted,
    flexShrink: 1,
  },
  mapaContenedor: {
    flex: 1,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  botonUbicacion: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  botonUbicacionTexto: {
    fontSize: 22,
    color: colors.accent,
  },
  tarjetaMarcador: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  tarjetaMarcadorNombre: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginRight: spacing.sm,
  },
  tarjetaMarcadorAccion: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  lista: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  descargo: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
