import { Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { es } from '@/i18n/es';
import { colors } from '@/theme/colors';

function Icono({ emoji }: { emoji: string }) {
  return <Text style={styles.icono}>{emoji}</Text>;
}

export default function MainTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontWeight: '700' },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: es.tabs.inicio,
          headerShown: false,
          tabBarIcon: () => <Icono emoji="📍" />,
        }}
      />
      <Tabs.Screen
        name="reportar"
        options={{
          title: es.tabs.reportar,
          tabBarIcon: () => <Icono emoji="➕" />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: es.tabs.perfil,
          tabBarIcon: () => <Icono emoji="👤" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icono: {
    fontSize: 18,
  },
});
