import { memo } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';
import type { SerieAtiva, ExercicioAtivo } from '@/stores/activeWorkoutStore';

interface SetRowProps {
  serie: SerieAtiva;
  tipoMedicao: ExercicioAtivo['tipoMedicao'];
  onChangeCarga: (v: string) => void;
  onChangeReps: (v: string) => void;
  onChangeDuracao: (v: string) => void;
  onToggleConcluido: () => void;
  onLongPress?: () => void;
}

function placeholderAnterior(
  tipo: ExercicioAtivo['tipoMedicao'],
  serie: SerieAtiva
): string {
  if (tipo === 'tempo') {
    if (serie.duracaoAnterior != null) return `${serie.duracaoAnterior}s`;
    return '—';
  }
  const c = serie.cargaAnterior;
  const r = serie.repsAnteriores;
  if (c != null && r != null) return `${c}kg × ${r}`;
  if (r != null) return `× ${r}`;
  return '—';
}

export const SetRow = memo(function SetRow({
  serie,
  tipoMedicao,
  onChangeCarga,
  onChangeReps,
  onChangeDuracao,
  onToggleConcluido,
  onLongPress,
}: SetRowProps) {
  const isTempo = tipoMedicao === 'tempo';
  const concluido = serie.concluido;

  const phCarga = serie.cargaAnterior != null ? String(serie.cargaAnterior) : 'kg';
  const phReps = serie.repsAnteriores != null ? String(serie.repsAnteriores) : 'reps';
  const phDuracao = serie.duracaoAnterior != null ? String(serie.duracaoAnterior) : 's';

  const podeConcluir = isTempo
    ? serie.duracao !== '' || serie.duracaoAnterior != null
    : serie.reps !== '' || serie.repsAnteriores != null;

  return (
    <View
      className={[
        'flex-row items-center gap-2 py-2 px-2 rounded-lg',
        concluido ? 'bg-accent/10' : '',
      ].join(' ')}
    >
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={400}
        className="w-7 h-9 items-center justify-center"
      >
        <Text className="text-muted text-base font-bold">
          {serie.numeroSerie}
        </Text>
      </Pressable>

      <View className="flex-[1.4]">
        <Text className="text-muted text-xs text-center" numberOfLines={1}>
          {placeholderAnterior(tipoMedicao, serie)}
        </Text>
      </View>

      {!isTempo && (
        <View className="flex-1">
          <TextInput
            value={serie.carga}
            onChangeText={onChangeCarga}
            placeholder={phCarga}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            selectTextOnFocus
            className={[
              'h-11 text-center text-base font-semibold rounded-lg border',
              concluido
                ? 'bg-surface-2 border-border text-muted'
                : 'bg-surface-2 border-border text-text',
            ].join(' ')}
          />
        </View>
      )}

      <View className="flex-1">
        <TextInput
          value={isTempo ? serie.duracao : serie.reps}
          onChangeText={isTempo ? onChangeDuracao : onChangeReps}
          placeholder={isTempo ? phDuracao : phReps}
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          selectTextOnFocus
          className={[
            'h-11 text-center text-base font-semibold rounded-lg border',
            concluido
              ? 'bg-surface-2 border-border text-muted'
              : 'bg-surface-2 border-border text-text',
          ].join(' ')}
        />
      </View>

      <Pressable
        onPress={() => {
          if (!podeConcluir && !concluido) {
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            ).catch(() => {});
            return;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => {}
          );
          onToggleConcluido();
        }}
        className={[
          'w-11 h-11 items-center justify-center rounded-lg border',
          concluido
            ? 'bg-accent border-accent'
            : podeConcluir
              ? 'bg-surface-2 border-border'
              : 'bg-surface-2 border-border opacity-40',
        ].join(' ')}
        hitSlop={6}
      >
        <Text
          className={
            concluido
              ? 'text-bg text-lg font-bold'
              : 'text-muted text-lg font-bold'
          }
        >
          {concluido ? '✓' : ' '}
        </Text>
      </Pressable>
    </View>
  );
});
