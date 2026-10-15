import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { buscarPunto } from '@/data';
import { es } from '@/i18n/es';
import { useEcoStore } from '@/store/useEcoStore';
import { colors } from '@/theme/colors';
import { radius, spacing, MIN_TAP_TARGET } from '@/theme/spacing';
import type { HistorialItem } from '@/types';

function nivelPara(total: number): {
  nombre: string;
  mensaje: string;
} {
  if (total >= 15) {
    return { nombre: es.profile.level.tree, mensaje: es.profile.level.treeMsg };
  }
  if (total >= 5) {
    return { nombre: es.profile.level.sprout, mensaje: es.profile.level.sproutMsg };
  }
  return { nombre: es.profile.level.seed, mensaje: es.profile.level.seedMsg };
}

export default function ProfileScreen() {
  const nombreUsuario = useEcoStore((s) => s.nombreUsuario);
  const setNombreUsuario = useEcoStore((s) => s.setNombreUsuario);
  const aportes = useEcoStore((s) => s.aportes);
  const sugerencias = useEcoStore((s) => s.sugerencias);

  const [nombreInput, setNombreInput] = useState(nombreUsuario);
  const [guardado, setGuardado] = useState(false);

  const historial = useMemo<HistorialItem[]>(() => {
    const aportesItems: HistorialItem[] = aportes.map((a) => ({
      id: a.id,
      tipo: 'aporte',
      fecha: a.fecha,
      nombre: buscarPunto(a.puntoId)?.nombre ?? 'Punto de acopio',
      estado: 'aprobado',
    }));
    const sugerenciasItems: HistorialItem[] = sugerencias.map((s) => ({
      id: s.id,
      tipo: 'sugerencia',
      fecha: s.fecha,
      nombre: s.nombre,
      estado: s.estado === 'rechazado' ? 'pendiente' : s.estado,
    }));
    return [...aportesItems, ...sugerenciasItems].sort((a, b) =>
      b.fecha.localeCompare(a.fecha),
    );
  }, [aportes, sugerencias]);

  const total = aportes.length + sugerencias.length;
  const nivel = nivelPara(total);

  function guardarNombre() {
    setNombreUsuario(nombreInput.trim());
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <FlatList
      style={styles.scroll}
      contentContainerStyle={styles.contenido}
      data={historial}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.perfilFila}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {nombreUsuario.trim()
                  ? nombreUsuario.trim().charAt(0).toUpperCase()
                  : '👤'}
              </Text>
            </View>
            <View style={styles.nombreFormulario}>
              <TextInput
                value={nombreInput}
                onChangeText={setNombreInput}
                placeholder={es.profile.namePlaceholder}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                accessibilityLabel={es.profile.name}
              />
              <Pressable
                onPress={guardarNombre}
                style={styles.botonGuardar}
                accessibilityRole="button"
                accessibilityLabel={es.profile.save}
              >
                <Text style={styles.botonGuardarTexto}>
                  {guardado ? es.profile.saved : es.profile.save}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.contadores}>
            <View style={styles.contador}>
              <Text style={styles.contadorNumero}>{aportes.length}</Text>
              <Text style={styles.contadorEtiqueta}>{es.profile.contributions}</Text>
            </View>
            <View style={styles.contador}>
              <Text style={styles.contadorNumero}>{sugerencias.length}</Text>
              <Text style={styles.contadorEtiqueta}>{es.profile.registered}</Text>
            </View>
          </View>

          <View style={styles.nivel}>
            <Text style={styles.nivelNombre}>{nivel.nombre}</Text>
            <Text style={styles.nivelMensaje}>{nivel.mensaje}</Text>
          </View>

          <Text style={styles.historialTitulo}>{es.profile.history}</Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.historialVacio}>{es.profile.historyEmpty}</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.historialItem}>
          <View style={styles.historialInfo}>
            <Text style={styles.historialNombre} numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text style={styles.historialFecha}>
              {new Date(item.fecha).toLocaleDateString('es-PE')} ·{' '}
              {item.tipo === 'aporte'
                ? es.profile.typeContribution
                : es.profile.typeSuggestion}
            </Text>
          </View>
          <View
            style={[
              styles.estado,
              item.estado === 'aprobado' ? styles.estadoAprobado : styles.estadoPendiente,
            ]}
          >
            <Text
              style={[
                styles.estadoTexto,
                item.estado === 'aprobado'
                  ? styles.estadoTextoAprobado
                  : styles.estadoTextoPendiente,
              ]}
            >
              {item.estado}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenido: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  perfilFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  nombreFormulario: {
    flex: 1,
    gap: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  botonGuardar: {
    alignSelf: 'flex-start',
    minHeight: MIN_TAP_TARGET - 16,
    justifyContent: 'center',
  },
  botonGuardarTexto: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  contadores: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contador: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  contadorNumero: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  contadorEtiqueta: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  nivel: {
    backgroundColor: '#E8F5E9',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  nivelNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  nivelMensaje: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  historialTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  historialVacio: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  historialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  historialInfo: {
    flex: 1,
    gap: 2,
  },
  historialNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  historialFecha: {
    fontSize: 12,
    color: colors.textMuted,
  },
  estado: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  estadoAprobado: {
    backgroundColor: '#E8F5E9',
  },
  estadoPendiente: {
    backgroundColor: '#FFF3E0',
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  estadoTextoAprobado: {
    color: colors.primaryDark,
  },
  estadoTextoPendiente: {
    color: '#B26A00',
  },
});
