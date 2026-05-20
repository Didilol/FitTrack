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

  const handleLongPressSerie = useCallback(
    (serieId: string) => {
      Alert.alert('Remover série?', 'Esta série será descartada.', [
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

  const isTempo = exercicio.tipoMedicao === 'tempo';

  return (
    <View className="bg-surface rounded-2xl border border-border p-4 mb-3">
      <View className="mb-3">
        <Text className="text-text text-base font-semibold">
          {exercicio.nome}
        </Text>
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

      <Pressable
        onPress={() => adicionarSerie(exercicio.id)}
        className="h-11 mt-2 rounded-lg bg-surface-2 border border-dashed border-border items-center justify-center"
      >
        <Text className="text-muted font-semibold text-sm">+ Série</Text>
      </Pressable>
    </View>
  );
});
