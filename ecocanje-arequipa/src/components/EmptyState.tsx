import { Pressable, StyleSheet, Text, View } from 'react-native';

import { es } from '@/i18n/es';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

interface Props {
  onSuggest: () => void;
}

export function EmptyState({ onSuggest }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>♻️</Text>
      <Text style={styles.titulo}>{es.home.empty}</Text>
      <Pressable
        onPress={onSuggest}
        style={styles.boton}
        accessibilityRole="button"
        accessibilityLabel={es.home.suggest}
      >
        <Text style={styles.botonTexto}>{es.home.suggest}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 40,
  },
  titulo: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  botonTexto: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 15,
  },
});
