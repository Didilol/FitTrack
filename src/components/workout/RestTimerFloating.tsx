import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveWorkoutStore } from '@/stores/activeWorkoutStore';
import { formatDuracao } from '@/utils/format';

export function RestTimerFloating() {
  const restTimer = useActiveWorkoutStore((s) => s.restTimer);
  const ajustar = useActiveWorkoutStore((s) => s.ajustarDescanso);
  const cancelar = useActiveWorkoutStore((s) => s.cancelarDescanso);
  const insets = useSafeAreaInsets();

  if (!restTimer.ativo) return null;

  const pct =
    restTimer.duracao > 0
      ? Math.max(0, Math.min(100, (restTimer.restante / restTimer.duracao) * 100))
      : 0;

  return (
    <View
      className="absolute left-3 right-3 bg-surface-2 rounded-2xl border border-accent overflow-hidden"
      style={{ elevation: 8, bottom: Math.max(insets.bottom, 12) }}
    >
      <View
        className="absolute left-0 top-0 bottom-0 bg-accent/20"
        style={{ width: `${pct}%` }}
      />
      <View className="flex-row items-center justify-between px-4 py-3">
        <View>
          <Text className="text-muted text-[11px] uppercase font-semibold tracking-wider">
            Descanso
          </Text>
          <Text className="text-accent text-3xl font-bold mt-0.5">
            {formatDuracao(restTimer.restante)}
          </Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => ajustar(-15)}
            className="w-12 h-12 rounded-full bg-bg border border-border items-center justify-center"
          >
            <Text className="text-text font-bold">−15</Text>
          </Pressable>
          <Pressable
            onPress={() => ajustar(15)}
            className="w-12 h-12 rounded-full bg-bg border border-border items-center justify-center"
          >
            <Text className="text-text font-bold">+15</Text>
          </Pressable>
          <Pressable
            onPress={cancelar}
            className="w-12 h-12 rounded-full bg-bg border border-border items-center justify-center"
          >
            <Text className="text-danger text-lg">✕</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
