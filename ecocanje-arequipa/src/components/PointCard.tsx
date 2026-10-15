import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PuntoConDistancia } from '@/hooks/useFilteredPoints';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { CATEGORIA_LABEL, CATEGORIA_COLOR } from '@/utils/categories';
import { formatearDistancia } from '@/utils/distance';
import { VerificationBadge } from './VerificationBadge';

interface Props {
  punto: PuntoConDistancia;
  onPress: () => void;
}

export function PointCard({ punto, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${punto.nombre}, a ${formatearDistancia(
        punto.distanciaKm,
      )}`}
    >
      <View style={styles.encabezado}>
        <Text style={styles.nombre} numberOfLines={2}>
          {punto.nombre}
        </Text>
        {Number.isFinite(punto.distanciaKm) && (
          <Text style={styles.distancia}>
            {formatearDistancia(punto.distanciaKm)}
          </Text>
        )}
      </View>

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

      <View style={styles.pie}>
        <Text style={styles.distrito} numberOfLines={1}>
          {punto.distrito}
        </Text>
        <VerificationBadge estado={punto.verificacion} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  nombre: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  distancia: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
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
    fontSize: 12,
    fontWeight: '600',
  },
  pie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distrito: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
});
