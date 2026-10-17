import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { Categoria } from '@/types';
import { CATEGORIA_LABEL, CATEGORIAS, CATEGORIA_COLOR } from '@/utils/categories';

interface Props {
  seleccionadas: Categoria[];
  onToggle: (categoria: Categoria) => void;
}

export function CategoryFilterChips({ seleccionadas, onToggle }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contenedor}
      style={styles.scroll}
    >
      {CATEGORIAS.map((categoria) => {
        const activa = seleccionadas.includes(categoria);
        const color = CATEGORIA_COLOR[categoria];
        return (
          <Pressable
            key={categoria}
            onPress={() => onToggle(categoria)}
            accessibilityRole="button"
            accessibilityState={{ selected: activa }}
            accessibilityLabel={CATEGORIA_LABEL[categoria]}
            style={[
              styles.chip,
              activa ? { backgroundColor: color, borderColor: color } : {},
            ]}
          >
            <Text
              allowFontScaling={false}
              maxFontSizeMultiplier={1}
              style={[
                styles.texto,
                activa ? styles.textoActivo : { color: colors.text },
              ]}
            >
              {CATEGORIA_LABEL[categoria]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  contenedor: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  texto: {
    fontSize: 13,
    fontWeight: '600',
  },
  textoActivo: {
    color: colors.surface,
  },
});
