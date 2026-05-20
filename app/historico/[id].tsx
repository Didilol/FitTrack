import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  buscarSeriesDoTreino,
  buscarTreinoPorId,
  type SerieDoTreino,
} from '@/database/repositories/historico';
import { getDatabase } from '@/database/database';
import { formatDataCurta, formatDuracao } from '@/utils/format';
import type { HistoricoTreino } from '@/types';

interface ExercicioAgrupado {
  exercicio_id: number;
  nome: string;
  tipo_medicao: 'reps' | 'tempo';
  series: SerieDoTreino[];
}

export default function DetalheTreino() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const treinoId = parseInt(id ?? '0', 10);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [treino, setTreino] = useState<HistoricoTreino | null>(null);
  const [series, setSeries] = useState<SerieDoTreino[]>([]);

  const carregar = useCallback(async () => {
    if (!treinoId) return;
    const [t, s] = await Promise.all([
      buscarTreinoPorId(treinoId),
      buscarSeriesDoTreino(treinoId),
    ]);
    setTreino(t);
    setSeries(s);
  }, [treinoId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const agrupados = useMemo<ExercicioAgrupado[]>(() => {
    const mapa = new Map<number, ExercicioAgrupado>();
    for (const s of series) {
      const g = mapa.get(s.exercicio_id);
      if (g) {
        g.series.push(s);
      } else {
        mapa.set(s.exercicio_id, {
          exercicio_id: s.exercicio_id,
          nome: s.exercicio_nome,
          tipo_medicao: s.tipo_medicao,
          series: [s],
        });
      }
    }
    return Array.from(mapa.values());
  }, [series]);

  const totalSeries = series.length;
  const volumeTotal = useMemo(
    () => series.reduce((acc, s) => acc + s.carga * s.repeticoes, 0),
    [series]
  );

  function confirmarEliminar() {
    if (!treino) return;
    Alert.alert(
      'Eliminar treino?',
      'Esta entrada de histórico será removida. Não tem volta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const db = await getDatabase();
            await db.runAsync(
              `DELETE FROM historico_treinos WHERE id = ?`,
              [treino.id]
            );
            router.back();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <Stack.Screen options={{ title: treino?.nome_treino ?? 'Treino' }} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100 + insets.bottom,
          gap: 12,
        }}
      >
        {treino ? (
          <Card>
            <Text className="text-muted text-xs uppercase font-bold tracking-wider">
              {formatDataCurta(treino.data_inicio)}
            </Text>
            <Text className="text-text text-xl font-bold mt-1">
              {treino.nome_treino}
            </Text>
            <View className="flex-row gap-4 mt-3">
              <View>
                <Text className="text-muted text-[11px] uppercase tracking-wider">
                  Duração
                </Text>
                <Text className="text-text text-base font-semibold mt-0.5 tabular-nums">
                  {formatDuracao(treino.duracao_segundos ?? 0)}
                </Text>
              </View>
              <View>
                <Text className="text-muted text-[11px] uppercase tracking-wider">
                  Séries
                </Text>
                <Text className="text-text text-base font-semibold mt-0.5">
                  {totalSeries}
                </Text>
              </View>
              {volumeTotal > 0 && (
                <View>
                  <Text className="text-muted text-[11px] uppercase tracking-wider">
                    Volume
                  </Text>
                  <Text className="text-text text-base font-semibold mt-0.5 tabular-nums">
                    {Math.round(volumeTotal).toLocaleString('pt-BR')} kg
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ) : null}

        {agrupados.map((ex) => (
          <Card key={ex.exercicio_id}>
            <View className="flex-row items-center justify-between">
              <Text className="text-text text-base font-semibold flex-1">
                {ex.nome}
              </Text>
              <Pressable
                onPress={() => router.push(`/exercicio/${ex.exercicio_id}`)}
                hitSlop={6}
              >
                <Text className="text-accent text-xs font-semibold">
                  Progressão →
                </Text>
              </Pressable>
            </View>

            <View className="mt-3 gap-1.5">
              {ex.series.map((s) => (
                <View
                  key={s.numero_serie}
                  className="flex-row items-center gap-3 bg-surface-2 rounded-lg px-3 py-2"
                >
                  <Text className="text-muted text-xs font-bold w-5 text-center">
                    {s.numero_serie}
                  </Text>
                  {ex.tipo_medicao === 'tempo' ? (
                    <Text className="text-text text-sm flex-1">
                      {s.duracao_segundos ? `${s.duracao_segundos}s` : '—'}
                    </Text>
                  ) : (
                    <Text className="text-text text-sm flex-1">
                      {s.carga > 0 ? `${s.carga} kg` : 'sem carga'}
                      {'  ×  '}
                      <Text className="text-accent font-semibold">
                        {s.repeticoes}
                      </Text>{' '}
                      reps
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>

      <View
        className="absolute left-0 right-0 bottom-0 bg-bg border-t border-border px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
      >
        <Button variant="secondary" size="lg" fullWidth onPress={confirmarEliminar}>
          Eliminar treino do histórico
        </Button>
      </View>
    </SafeAreaView>
  );
}
