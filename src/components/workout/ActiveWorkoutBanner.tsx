import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveWorkoutStore } from '@/stores/activeWorkoutStore';
import { formatDuracao } from '@/utils/format';

export function ActiveWorkoutBanner() {
  const router = useRouter();
  const dataInicio = useActiveWorkoutStore((s) => s.dataInicio);
  const nomeTreino = useActiveWorkoutStore((s) => s.nomeTreino);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!dataInicio) return;
    setAgora(Date.now());
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [dataInicio]);

  if (!dataInicio) return null;

  const segundos = Math.max(0, Math.floor((agora - dataInicio) / 1000));

  return (
    <View className="px-3 pt-2">
      <Pressable
        onPress={() => router.push('/treino/ativo')}
        className="flex-row items-center justify-between bg-accent/15 border border-accent rounded-xl px-3 py-2"
      >
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <View className="w-2 h-2 rounded-full bg-accent" />
          <View className="flex-1">
            <Text className="text-accent text-[11px] font-bold uppercase tracking-wider">
              Treino em andamento
            </Text>
            <Text className="text-text text-sm font-semibold" numberOfLines={1}>
              {nomeTreino || 'Sessão ativa'}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-accent text-base font-bold tabular-nums">
            {formatDuracao(segundos)}
          </Text>
          <Text className="text-accent text-base font-bold">›</Text>
        </View>
      </Pressable>
    </View>
  );
}
