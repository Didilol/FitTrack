import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { LineChart } from '@/components/charts/LineChart';
import {
  progressaoExercicio,
  type PontoProgressao,
} from '@/database/repositories/historico';
import { buscarExercicioPorId } from '@/database/repositories/exercicios';
import { formatDataCurta } from '@/utils/format';
import type { Exercicio } from '@/types';

type Metrica = 'carga' | 'volume' | 'reps';

const METRICAS: Array<{ id: Metrica; label: string; tipoCompat: 'reps' | 'all' }> = [
  { id: 'carga', label: 'Carga máx', tipoCompat: 'reps' },
  { id: 'volume', label: 'Volume', tipoCompat: 'reps' },
  { id: 'reps', label: 'Reps máx', tipoCompat: 'all' },
];

export default function ProgressaoExercicio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exId = parseInt(id ?? '0', 10);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [exercicio, setExercicio] = useState<Exercicio | null>(null);
  const [pontos, setPontos] = useState<PontoProgressao[]>([]);
  const [metrica, setMetrica] = useState<Metrica>('carga');

  const carregar = useCallback(async () => {
    if (!exId) return;
    const [ex, prog] = await Promise.all([
      buscarExercicioPorId(exId),
      progressaoExercicio(exId),
    ]);
    setExercicio(ex);
    setPontos(prog);
    if (ex?.tipo_medicao === 'tempo') setMetrica('reps');
  }, [exId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const chartPoints = useMemo(
    () =>
      pontos.map((p) => ({
        x: new Date(p.data_inicio).getTime(),
        y:
          metrica === 'carga'
            ? p.carga_max
            : metrica === 'volume'
            ? p.volume
            : p.reps_max,
      })),
    [pontos, metrica]
  );

  const stats = useMemo(() => {
    if (pontos.length === 0) return null;
    const valores = chartPoints.map((p) => p.y);
    const max = Math.max(...valores);
    const ultimo = valores[valores.length - 1];
    const primeiro = valores[0];
    const delta = primeiro === 0 ? 0 : ((ultimo - primeiro) / primeiro) * 100;
    return { max, ultimo, delta, total: pontos.length };
  }, [chartPoints, pontos]);

  const isTempo = exercicio?.tipo_medicao === 'tempo';

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <Stack.Screen options={{ title: exercicio?.nome ?? 'Progressão' }} />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32 + insets.bottom,
          gap: 12,
        }}
      >
        {exercicio?.grupo_muscular ? (
          <Text className="text-muted text-xs uppercase font-bold tracking-wider">
            {exercicio.grupo_muscular}
          </Text>
        ) : null}

        {pontos.length === 0 ? (
          <Card>
            <Text className="text-text font-semibold">Sem histórico</Text>
            <Text className="text-muted text-sm mt-1">
              Faz pelo menos um treino com este exercício para ver a evolução.
            </Text>
          </Card>
        ) : (
          <>
            <View className="flex-row gap-2">
              {METRICAS.filter(
                (m) => !isTempo || m.tipoCompat === 'all'
              ).map((m) => (
                <Pressable
                  key={m.id}
                  onPress={() => setMetrica(m.id)}
                  className={[
                    'flex-1 h-10 rounded-lg items-center justify-center border',
                    metrica === m.id
                      ? 'bg-accent border-accent'
                      : 'bg-surface-2 border-border',
                  ].join(' ')}
                >
                  <Text
                    className={
                      metrica === m.id
                        ? 'text-bg font-semibold text-sm'
                        : 'text-muted text-sm'
                    }
                  >
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <LineChart
              points={chartPoints}
              width={width - 32}
              height={220}
              formatY={(n) =>
                metrica === 'volume'
                  ? Math.round(n).toLocaleString('pt-BR')
                  : metrica === 'reps'
                  ? `${Math.round(n)}`
                  : `${Math.round(n)}kg`
              }
              formatX={(ts) => {
                const d = new Date(ts);
                return `${String(d.getDate()).padStart(2, '0')}/${String(
                  d.getMonth() + 1
                ).padStart(2, '0')}`;
              }}
            />

            {stats ? (
              <View className="flex-row gap-2">
                <Card className="flex-1">
                  <Text className="text-muted text-[11px] uppercase tracking-wider">
                    Atual
                  </Text>
                  <Text className="text-text text-xl font-bold mt-1 tabular-nums">
                    {Math.round(stats.ultimo).toLocaleString('pt-BR')}
                    {metrica !== 'reps' && metrica !== 'volume' ? ' kg' : ''}
                  </Text>
                </Card>
                <Card className="flex-1">
                  <Text className="text-muted text-[11px] uppercase tracking-wider">
                    Máximo
                  </Text>
                  <Text className="text-text text-xl font-bold mt-1 tabular-nums">
                    {Math.round(stats.max).toLocaleString('pt-BR')}
                    {metrica !== 'reps' && metrica !== 'volume' ? ' kg' : ''}
                  </Text>
                </Card>
                <Card className="flex-1">
                  <Text className="text-muted text-[11px] uppercase tracking-wider">
                    Δ desde 1º
                  </Text>
                  <Text
                    className={[
                      'text-xl font-bold mt-1 tabular-nums',
                      stats.delta > 0
                        ? 'text-success'
                        : stats.delta < 0
                        ? 'text-danger'
                        : 'text-text',
                    ].join(' ')}
                  >
                    {stats.delta > 0 ? '+' : ''}
                    {stats.delta.toFixed(0)}%
                  </Text>
                </Card>
              </View>
            ) : null}

            <Text className="text-muted text-xs uppercase font-bold tracking-wider mt-4 mb-1">
              Treinos ({pontos.length})
            </Text>
            <View className="gap-2">
              {[...pontos].reverse().map((p) => (
                <Card key={p.treino_id}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-text text-sm font-semibold">
                      {formatDataCurta(p.data_inicio)}
                    </Text>
                    <Text className="text-muted text-xs">
                      {p.carga_max > 0 && `${p.carga_max}kg`}
                      {p.carga_max > 0 && p.reps_max > 0 && ' · '}
                      {p.reps_max > 0 && `${p.reps_max} reps`}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
