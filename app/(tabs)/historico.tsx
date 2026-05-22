import { useCallback, useState } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { listarHistorico } from '@/database/repositories/historico';
import { formatDataCurta, formatDuracao } from '@/utils/format';
import type { HistoricoTreino } from '@/types';

export default function HistoricoScreen() {
  const router = useRouter();
  const [treinos, setTreinos] = useState<HistoricoTreino[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    const lista = await listarHistorico();
    setTreinos(lista);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await carregar();
              setRefreshing(false);
            }}
            tintColor="#CCFF00"
          />
        }
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text text-2xl font-bold">Histórico</Text>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => router.push('/exercicio/picker')}
          >
            Progressão
          </Button>
        </View>

        {treinos.length === 0 ? (
          <Card>
            <Text className="text-text font-semibold">Sem treinos ainda</Text>
            <Text className="text-muted text-sm mt-1">
              Quando terminares um treino, ele aparece aqui com data, duração e
              séries.
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {treinos.map((t) => (
              <Card key={t.id} onPress={() => router.push(`/historico/${t.id}`)}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-text text-base font-semibold">
                      {t.nome_treino}
                    </Text>
                    <Text className="text-muted text-xs mt-0.5">
                      {formatDataCurta(t.data_inicio)}
                    </Text>
                  </View>
                  <View className="bg-surface-2 px-2.5 py-1 rounded-full">
                    <Text className="text-accent text-xs font-semibold tabular-nums">
                      {formatDuracao(t.duracao_segundos ?? 0)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
