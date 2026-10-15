import { StyleSheet, Text, View } from 'react-native';

import { es } from '@/i18n/es';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import type { Verificacion } from '@/types';

const ESTILO: Record<Verificacion, { bg: string; fg: string }> = {
  verificado: { bg: '#E8F5E9', fg: colors.primaryDark },
  parcial: { bg: '#FFF3E0', fg: '#B26A00' },
  por_verificar: { bg: '#ECEFF1', fg: '#546E7A' },
};

export function VerificationBadge({ estado }: { estado: Verificacion }) {
  const estilo = ESTILO[estado];
  return (
    <View
      style={[styles.badge, { backgroundColor: estilo.bg }]}
      accessibilityLabel={es.verification[estado]}
    >
      <Text style={[styles.texto, { color: estilo.fg }]}>
        {es.verification[estado]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  texto: {
    fontSize: 12,
    fontWeight: '600',
  },
});
