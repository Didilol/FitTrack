import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import { initDatabase } from '@/database/database';
import { useSettingsStore } from '@/stores/settingsStore';
import { colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});

export default function RootLayout() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const carregarSettings = useSettingsStore((s) => s.carregar);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        await carregarSettings();
        setPronto(true);
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro desconhecido');
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, [carregarSettings]);

  if (erro) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text style={{ color: colors.danger, fontSize: 16, marginBottom: 8 }}>
          Falha ao iniciar a base de dados
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center' }}>
          {erro}
        </Text>
      </View>
    );
  }

  if (!pronto) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { color: colors.text, fontWeight: '600' },
            contentStyle: { backgroundColor: colors.bg },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="rotina/nova"
            options={{ title: 'Nova rotina', presentation: 'modal' }}
          />
          <Stack.Screen
            name="rotina/[id]"
            options={{ title: 'Rotina' }}
          />
          <Stack.Screen
            name="treino/ativo"
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="historico/[id]"
            options={{ title: 'Treino' }}
          />
          <Stack.Screen
            name="exercicio/picker"
            options={{ title: 'Progressão' }}
          />
          <Stack.Screen
            name="exercicio/[id]"
            options={{ title: 'Progressão' }}
          />
          <Stack.Screen
            name="medidas/nova"
            options={{ title: 'Nova medida', presentation: 'modal' }}
          />
          <Stack.Screen
            name="galeria/nova"
            options={{ title: 'Nova foto', presentation: 'modal' }}
          />
          <Stack.Screen
            name="galeria/comparar"
            options={{ title: 'Comparar fotos' }}
          />
          <Stack.Screen
            name="galeria/[data]"
            options={{ title: 'Sessão' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
