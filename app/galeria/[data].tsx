import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import {
  eliminarFoto,
  listarFotosPorData,
} from '@/database/repositories/fotos';
import { formatDataCurta } from '@/utils/format';
import type { FotoProgresso } from '@/types';

const ANGULO_LABELS: Record<string, string> = {
  frente: 'Frente',
  lado: 'Lado',
  costas: 'Costas',
};

export default function GaleriaPorData() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const insets = useSafeAreaInsets();
  const [fotos, setFotos] = useState<FotoProgresso[]>([]);

  const carregar = useCallback(async () => {
    if (!data) return;
    const lista = await listarFotosPorData(data);
    setFotos(lista);
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function confirmarEliminar(f: FotoProgresso) {
    Alert.alert(
      'Eliminar foto?',
      'Esta foto será removida do registo e do disco.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await eliminarFoto(f.id);
            await carregar();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <Stack.Screen
        options={{ title: data ? formatDataCurta(data) : 'Galeria' }}
      />
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32 + insets.bottom,
          gap: 12,
        }}
      >
        {fotos.length === 0 ? (
          <Card>
            <Text className="text-text font-semibold">Sem fotos</Text>
            <Text className="text-muted text-sm mt-1">
              As fotos desta data foram removidas.
            </Text>
          </Card>
        ) : (
          fotos.map((f) => (
            <Card key={f.id}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-text font-semibold">
                  {ANGULO_LABELS[f.angulo] ?? f.angulo}
                </Text>
                <Pressable onPress={() => confirmarEliminar(f)} hitSlop={6}>
                  <Text className="text-danger text-xs font-semibold">
                    Eliminar
                  </Text>
                </Pressable>
              </View>
              <View className="aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border border-border">
                <Image
                  source={{ uri: f.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              {f.observacoes ? (
                <Text className="text-muted text-xs mt-2 italic">
                  {f.observacoes}
                </Text>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
