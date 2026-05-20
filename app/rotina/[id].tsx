import { useCallback, useState } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  buscarRotinaPorId,
  eliminarRotina,
  listarExerciciosDaRotina,
} from '@/database/repositories/rotinas';
import { useActiveWorkoutStore } from '@/stores/activeWorkoutStore';
import { montarExerciciosAtivos } from '@/services/treino';
import type { Rotina, RotinaExercicioDetalhada } from '@/types';

export default function RotinaDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rotinaId = parseInt(id ?? '0', 10);
  const router = useRouter();
  const [rotina, setRotina] = useState<Rotina | null>(null);
  const [itens, setItens] = useState<RotinaExercicioDetalhada[]>([]);

  const carregar = useCallback(async () => {
    if (!rotinaId) return;
    const [r, lista] = await Promise.all([
      buscarRotinaPorId(rotinaId),
      listarExerciciosDaRotina(rotinaId),
    ]);
    setRotina(r);
    setItens(lista);
  }, [rotinaId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const iniciarTreinoStore = useActiveWorkoutStore((s) => s.iniciarTreino);
  const treinoEmCurso = useActiveWorkoutStore((s) => s.dataInicio !== null);
  const [a_iniciar, setAIniciar] = useState(false);
  const insets = useSafeAreaInsets();

  async function iniciarTreino() {
    if (!rotina) return;
    if (treinoEmCurso) {
      Alert.alert(
        'Treino em curso',
        'Já existe um treino ativo. Termina ou descarta-o primeiro.',
        [
          { text: 'Continuar treino', onPress: () => router.push('/treino/ativo') },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }
    if (itens.length === 0) {
      Alert.alert('Sem exercícios', 'Adiciona exercícios à rotina primeiro.');
      return;
    }
    setAIniciar(true);
    try {
      const exerciciosAtivos = await montarExerciciosAtivos(itens);
      iniciarTreinoStore({
        rotinaId: rotina.id,
        nomeTreino: rotina.nome,
        exercicios: exerciciosAtivos,
      });
      router.push('/treino/ativo');
    } catch (e) {
      Alert.alert(
        'Erro ao iniciar',
        e instanceof Error ? e.message : 'Erro desconhecido'
      );
    } finally {
      setAIniciar(false);
    }
  }

  function confirmarEliminar() {
    if (!rotina) return;
    Alert.alert(
      'Eliminar rotina',
      `Eliminar "${rotina.nome}"? O histórico não é afetado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await eliminarRotina(rotina.id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <Stack.Screen
        options={{ title: rotina?.nome ?? 'Rotina' }}
      />
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120 + insets.bottom,
        }}
      >
        {rotina?.descricao ? (
          <Card className="mb-4">
            <Text className="text-muted text-sm">{rotina.descricao}</Text>
          </Card>
        ) : null}

        <Text className="text-text text-base font-semibold mb-3">
          Exercícios ({itens.length})
        </Text>

        <View className="gap-3">
          {itens.map((it) => (
            <Card key={it.id}>
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text className="text-text text-base font-semibold">
                    {it.exercicio_nome}
                  </Text>
                  {it.exercicio_grupo && (
                    <Text className="text-muted text-xs mt-0.5">
                      {it.exercicio_grupo}
                    </Text>
                  )}
                </View>
                <View className="bg-surface-2 px-2.5 py-1 rounded-full">
                  <Text className="text-accent text-xs font-semibold">
                    {it.series_alvo ?? '?'} ×{' '}
                    {it.reps_alvo ?? '—'}
                    {it.tipo_medicao === 'tempo' ? 's' : ''}
                  </Text>
                </View>
              </View>

              {it.alternativas ? (
                <View className="flex-row flex-wrap gap-1.5 mt-3">
                  {it.alternativas.split(',').map((alt, i) => (
                    <View
                      key={i}
                      className="bg-surface-2 px-2.5 py-1 rounded-full border border-border"
                    >
                      <Text className="text-muted text-xs">{alt.trim()}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {it.notas ? (
                <Text className="text-muted text-xs mt-3 leading-relaxed">
                  {it.notas}
                </Text>
              ) : null}
            </Card>
          ))}
        </View>
      </ScrollView>

      <View
        className="absolute left-0 right-0 bottom-0 bg-bg border-t border-border px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
      >
        <View className="flex-row gap-2">
          <Button
            variant="secondary"
            size="lg"
            onPress={confirmarEliminar}
          >
            Eliminar
          </Button>
          <View className="flex-1">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={a_iniciar}
              onPress={iniciarTreino}
            >
              Iniciar treino
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
