import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { listarExerciciosComHistorico } from '@/database/repositories/historico';

interface Item {
  id: number;
  nome: string;
  grupo_muscular: string | null;
  tipo_medicao: 'reps' | 'tempo';
  total_series: number;
}

export default function PickerExercicio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [itens, setItens] = useState<Item[]>([]);

  const carregar = useCallback(async () => {
    const lista = await listarExerciciosComHistorico();
    setItens(lista as Item[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const porGrupo = itens.reduce<Record<string, Item[]>>((acc, it) => {
    const k = it.grupo_muscular ?? 'Outros';
    (acc[k] ??= []).push(it);
    return acc;
  }, {});

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <Stack.Screen options={{ title: 'Progressão' }} />
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32 + insets.bottom,
          gap: 16,
        }}
      >
        {itens.length === 0 ? (
          <Card>
            <Text className="text-text font-semibold">
              Ainda sem dados de progressão
            </Text>
            <Text className="text-muted text-sm mt-1">
              Termina pelo menos um treino para ver gráficos por exercício.
            </Text>
          </Card>
        ) : (
          Object.entries(porGrupo).map(([grupo, lista]) => (
            <View key={grupo}>
              <Text className="text-muted text-xs uppercase font-bold tracking-wider mb-2">
                {grupo}
              </Text>
              <View className="gap-2">
                {lista.map((it) => (
                  <Card
                    key={it.id}
                    onPress={() => router.push(`/exercicio/${it.id}`)}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-text font-semibold">{it.nome}</Text>
                      <Text className="text-muted text-xs">
                        {it.total_series} série{it.total_series === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
