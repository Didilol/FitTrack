import { useEffect, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getExercicioStatus,
  useActiveWorkoutStore,
} from '@/stores/activeWorkoutStore';
import { useInterval } from '@/hooks/useInterval';
import { Button } from '@/components/ui/Button';
import { ExerciseBlock } from '@/components/workout/ExerciseBlock';
import { RestTimerFloating } from '@/components/workout/RestTimerFloating';
import { formatDuracao } from '@/utils/format';
import { gravarHistoricoTreino } from '@/database/repositories/historico';

export default function TreinoAtivo() {
  const router = useRouter();
  const nomeTreino = useActiveWorkoutStore((s) => s.nomeTreino);
  const dataInicio = useActiveWorkoutStore((s) => s.dataInicio);
  const duracaoSegundos = useActiveWorkoutStore((s) => s.duracaoSegundos);
  const exercicios = useActiveWorkoutStore((s) => s.exercicios);
  const rotinaId = useActiveWorkoutStore((s) => s.rotinaId);
  const tickCronometro = useActiveWorkoutStore((s) => s.tickCronometro);
  const tickDescanso = useActiveWorkoutStore((s) => s.tickDescanso);
  const resetar = useActiveWorkoutStore((s) => s.resetar);
  const restTimerAtivo = useActiveWorkoutStore((s) => s.restTimer.ativo);

  useInterval(tickCronometro, dataInicio ? 1000 : null);
  useInterval(tickDescanso, restTimerAtivo ? 1000 : null);

  useEffect(() => {
    if (!dataInicio) {
      router.back();
    }
  }, [dataInicio, router]);

  const { totalConcluidas, exerciciosPendentes, podeFinalizar } = useMemo(() => {
    let concluidas = 0;
    let pendentes = 0;
    for (const ex of exercicios) {
      const status = getExercicioStatus(ex);
      if (status === 'pending') pendentes++;
      if (!ex.pulado) {
        for (const s of ex.series) {
          if (s.concluido) concluidas++;
        }
      }
    }
    return {
      totalConcluidas: concluidas,
      exerciciosPendentes: pendentes,
      podeFinalizar: exercicios.length > 0 && pendentes === 0,
    };
  }, [exercicios]);

  function confirmarDescartar() {
    Alert.alert(
      'Descartar treino?',
      'Tudo o que registaste será perdido.',
      [
        { text: 'Continuar a treinar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            resetar();
            router.back();
          },
        },
      ]
    );
  }

  async function finalizar() {
    if (!podeFinalizar) {
      Alert.alert(
        'Exercícios por resolver',
        `Ainda há ${exerciciosPendentes} exercício${exerciciosPendentes > 1 ? 's' : ''} sem todas as séries marcadas. Marca o check de todas as séries ou pula o exercício para finalizar.`
      );
      return;
    }

    Alert.alert(
      'Finalizar treino?',
      `${totalConcluidas} série${totalConcluidas === 1 ? '' : 's'} concluída${
        totalConcluidas === 1 ? '' : 's'
      } em ${formatDuracao(duracaoSegundos)}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: async () => {
            if (!dataInicio) return;
            try {
              await gravarHistoricoTreino({
                rotinaId,
                nomeTreino,
                dataInicioMs: dataInicio,
                dataFimMs: Date.now(),
                duracaoSegundos,
                exercicios,
              });
              resetar();
              router.back();
            } catch (e) {
              Alert.alert(
                'Erro a gravar',
                e instanceof Error ? e.message : 'Erro desconhecido'
              );
            }
          },
        },
      ]
    );
  }

  if (!dataInicio) return null;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-4 pt-3 pb-2 flex-row items-center justify-between bg-bg border-b border-border">
        <Pressable
          onPress={confirmarDescartar}
          hitSlop={8}
          className="w-10 h-10 items-center justify-center"
        >
          <Text className="text-danger text-2xl font-bold">✕</Text>
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="text-accent text-2xl font-bold tabular-nums">
            {formatDuracao(duracaoSegundos)}
          </Text>
          <Text className="text-muted text-[11px]" numberOfLines={1}>
            {nomeTreino}
          </Text>
        </View>
        <Pressable
          onPress={finalizar}
          hitSlop={8}
          disabled={!podeFinalizar}
          className={[
            'px-3 h-10 items-center justify-center rounded-lg',
            podeFinalizar ? 'bg-accent' : 'bg-surface-2 border border-border',
          ].join(' ')}
        >
          <Text
            className={[
              'font-bold text-sm',
              podeFinalizar ? 'text-bg' : 'text-muted',
            ].join(' ')}
          >
            Finalizar
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 12,
            paddingBottom: restTimerAtivo ? 140 : 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {exercicios.map((ex) => (
            <ExerciseBlock key={ex.id} exercicio={ex} />
          ))}

          <View className="mt-2 mb-4">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onPress={confirmarDescartar}
            >
              Descartar treino
            </Button>
          </View>
        </ScrollView>

        <RestTimerFloating />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
