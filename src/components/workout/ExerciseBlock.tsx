import { memo, useCallback } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import {
  useActiveWorkoutStore,
  type ExercicioAtivo,
} from '@/stores/activeWorkoutStore';
import { SetRow } from './SetRow';

interface Props {
  exercicio: ExercicioAtivo;
}

export const ExerciseBlock = memo(function ExerciseBlock({ exercicio }: Props) {
  const atualizarSerie = useActiveWorkoutStore((s) => s.atualizarSerie);
  const alternarConcluido = useActiveWorkoutStore((s) => s.alternarConcluido);
  const adicionarSerie = useActiveWorkoutStore((s) => s.adicionarSerie);
  const removerSerie = useActiveWorkoutStore((s) => s.removerSerie);
  const removerUltimaSerie = useActiveWorkoutStore(
    (s) => s.removerUltimaSerie
  );
  const alternarPularExercicio = useActiveWorkoutStore(
    (s) => s.alternarPularExercicio
  );

  const handleLongPressSerie = useCallback(
    (serieId: string) => {
      Alert.alert('Remover série?', 'Esta série será descartada nesta sessão.', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => removerSerie(exercicio.id, serieId),
        },
      ]);
    },
    [exercicio.id, removerSerie]
  );

  const handlePular = useCallback(() => {
    if (exercicio.pulado) {
      alternarPularExercicio(exercicio.id);
      return;
    }
    Alert.alert(
      'Pular exercício?',
      'O exercício será marcado como pulado nesta sessão.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pular',
          onPress: () => alternarPularExercicio(exercicio.id),
        },
      ]
    );
  }, [exercicio.id, exercicio.pulado, alternarPularExercicio]);

  const isTempo = exercicio.tipoMedicao === 'tempo';
  const delta = exercicio.series.length - exercicio.seriesAlvo;
  const badgeDelta =
    delta === 0 ? null : delta > 0 ? `+${delta}` : `${delta}`;

  if (exercicio.pulado) {
    return (
      <View className="bg-surface rounded-2xl border border-border p-4 mb-3 opacity-60">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-text text-base font-semibold line-through">
              {exercicio.nome}
            </Text>
            <Text className="text-muted text-xs mt-1">Pulado nesta sessão</Text>
          </View>
          <Pressable
            onPress={handlePular}
            className="px-3 h-9 rounded-lg bg-surface-2 border border-border items-center justify-center"
            hitSlop={6}
          >
            <Text className="text-text text-xs font-semibold">Reativar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-surface rounded-2xl border border-border p-4 mb-3">
      <View className="mb-3 flex-row items-start">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center flex-wrap gap-2">
            <Text className="text-text text-base font-semibold">
              {exercicio.nome}
            </Text>
            {badgeDelta ? (
              <View className="bg-surface-2 px-2 py-0.5 rounded-full border border-border">
                <Text className="text-muted text-[10px] font-bold">
                  {badgeDelta} série{Math.abs(delta) > 1 ? 's' : ''} • sessão
                </Text>
              </View>
            ) : null}
          </View>
          {exercicio.grupoMuscular ? (
            <Text className="text-muted text-xs mt-0.5">
              {exercicio.grupoMuscular}
            </Text>
          ) : null}

          {exercicio.alternativas ? (
            <View className="flex-row flex-wrap gap-1.5 mt-2">
              {exercicio.alternativas.split(',').map((alt, i) => (
                <View
                  key={i}
                  className="bg-surface-2 px-2 py-0.5 rounded-full border border-border"
                >
                  <Text className="text-muted text-[11px]">{alt.trim()}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {exercicio.notas ? (
            <Text className="text-muted text-xs mt-2 italic">
              {exercicio.notas}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={handlePular}
          className="px-2 h-9 rounded-lg bg-surface-2 border border-border items-center justify-center"
          hitSlop={6}
        >
          <Text className="text-muted text-xs font-semibold">⤼ Pular</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2 px-2 py-1 mb-1">
        <View className="w-7 items-center">
          <Text className="text-muted text-[10px] font-bold uppercase">
            #
          </Text>
        </View>
        <View className="flex-[1.4] items-center">
          <Text className="text-muted text-[10px] font-bold uppercase">
            Anterior
          </Text>
        </View>
        {!isTempo && (
          <View className="flex-1 items-center">
            <Text className="text-muted text-[10px] font-bold uppercase">
              Carga
            </Text>
          </View>
        )}
        <View className="flex-1 items-center">
          <Text className="text-muted text-[10px] font-bold uppercase">
            {isTempo ? 'Tempo' : 'Reps'}
          </Text>
        </View>
        <View className="w-11" />
      </View>

      {exercicio.series.map((s) => (
        <SetRow
          key={s.id}
          serie={s}
          tipoMedicao={exercicio.tipoMedicao}
          onChangeCarga={(v) => atualizarSerie(exercicio.id, s.id, 'carga', v)}
          onChangeReps={(v) => atualizarSerie(exercicio.id, s.id, 'reps', v)}
          onChangeDuracao={(v) =>
            atualizarSerie(exercicio.id, s.id, 'duracao', v)
          }
          onToggleConcluido={() => alternarConcluido(exercicio.id, s.id)}
          onLongPress={() => handleLongPressSerie(s.id)}
        />
      ))}

      {(() => {
        const ultima = exercicio.series[exercicio.series.length - 1];
        const podeRemover =
          exercicio.series.length > 1 && !(ultima?.concluido ?? false);
        const handleRemover = () => {
          const ok = removerUltimaSerie(exercicio.id);
          if (!ok) {
            if (exercicio.series.length <= 1) {
              Alert.alert(
                'Não é possível remover',
                'Cada exercício precisa ter pelo menos uma série.'
              );
            } else if (ultima?.concluido) {
              Alert.alert(
                'Série já concluída',
                'Desmarca o check antes de remover esta série.'
              );
            }
          }
        };
        return (
          <View className="flex-row gap-2 mt-2">
            <Pressable
              onPress={handleRemover}
              disabled={!podeRemover}
              className={[
                'w-12 h-11 rounded-lg border border-dashed border-border items-center justify-center',
                podeRemover ? 'bg-surface-2' : 'bg-surface-2 opacity-40',
              ].join(' ')}
              hitSlop={4}
            >
              <Text className="text-muted text-lg font-bold">−</Text>
            </Pressable>
            <Pressable
              onPress={() => adicionarSerie(exercicio.id)}
              className="flex-1 h-11 rounded-lg bg-surface-2 border border-dashed border-border items-center justify-center"
            >
              <Text className="text-muted font-semibold text-sm">
                + Série (só nesta sessão)
              </Text>
            </Pressable>
          </View>
        );
      })()}
    </View>
  );
});
