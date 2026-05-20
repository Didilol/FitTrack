import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import {
  listarDatasComFotos,
  listarFotosPorData,
} from '@/database/repositories/fotos';
import { formatDataCurta } from '@/utils/format';
import type { AnguloFoto, FotoProgresso } from '@/types';

const ANGULOS: AnguloFoto[] = ['frente', 'lado', 'costas'];
const ANGULO_LABELS: Record<AnguloFoto, string> = {
  frente: 'Frente',
  lado: 'Lado',
  costas: 'Costas',
};

export default function CompararFotos() {
  const insets = useSafeAreaInsets();
  const [datas, setDatas] = useState<string[]>([]);
  const [dataA, setDataA] = useState<string | null>(null);
  const [dataB, setDataB] = useState<string | null>(null);
  const [fotosA, setFotosA] = useState<FotoProgresso[]>([]);
  const [fotosB, setFotosB] = useState<FotoProgresso[]>([]);

  const carregarDatas = useCallback(async () => {
    const lista = await listarDatasComFotos();
    setDatas(lista);
    if (lista.length >= 2) {
      setDataA((prev) => prev ?? lista[lista.length - 1]);
      setDataB((prev) => prev ?? lista[0]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDatas();
    }, [carregarDatas])
  );

  useFocusEffect(
    useCallback(() => {
      if (dataA) listarFotosPorData(dataA).then(setFotosA);
      if (dataB) listarFotosPorData(dataB).then(setFotosB);
    }, [dataA, dataB])
  );

  const linhasComparacao = useMemo(() => {
    return ANGULOS.map((a) => ({
      angulo: a,
      a: fotosA.find((f) => f.angulo === a),
      b: fotosB.find((f) => f.angulo === a),
    })).filter((l) => l.a || l.b);
  }, [fotosA, fotosB]);

  function DatePicker({
    label,
    selected,
    onSelect,
  }: {
    label: string;
    selected: string | null;
    onSelect: (v: string) => void;
  }) {
    return (
      <View className="flex-1">
        <Text className="text-muted text-[10px] uppercase tracking-wider mb-1">
          {label}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
        >
          {datas.map((d) => (
            <Pressable
              key={d}
              onPress={() => onSelect(d)}
              className={[
                'px-3 h-9 rounded-lg items-center justify-center border',
                selected === d
                  ? 'bg-accent border-accent'
                  : 'bg-surface-2 border-border',
              ].join(' ')}
            >
              <Text
                className={
                  selected === d
                    ? 'text-bg text-xs font-semibold'
                    : 'text-muted text-xs'
                }
              >
                {formatDataCurta(d)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <Stack.Screen options={{ title: 'Comparar' }} />
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32 + insets.bottom,
          gap: 12,
        }}
      >
        {datas.length < 2 ? (
          <Card>
            <Text className="text-text font-semibold">
              Precisas de 2 sessões
            </Text>
            <Text className="text-muted text-sm mt-1">
              Adiciona fotos em pelo menos duas datas diferentes para comparar.
            </Text>
          </Card>
        ) : (
          <>
            <Card>
              <View className="flex-row gap-4">
                <DatePicker
                  label="Antes"
                  selected={dataA}
                  onSelect={setDataA}
                />
                <DatePicker
                  label="Depois"
                  selected={dataB}
                  onSelect={setDataB}
                />
              </View>
            </Card>

            {linhasComparacao.length === 0 ? (
              <Card>
                <Text className="text-muted text-sm">
                  Não há fotos coincidentes para os ângulos selecionados.
                </Text>
              </Card>
            ) : (
              linhasComparacao.map((linha) => (
                <View key={linha.angulo} className="gap-1.5">
                  <Text className="text-muted text-xs uppercase font-bold tracking-wider">
                    {ANGULO_LABELS[linha.angulo]}
                  </Text>
                  <View className="flex-row gap-2">
                    <View className="flex-1 aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border border-border">
                      {linha.a ? (
                        <Image
                          source={{ uri: linha.a.uri }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Text className="text-muted text-xs">sem foto</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1 aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border border-border">
                      {linha.b ? (
                        <Image
                          source={{ uri: linha.b.uri }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Text className="text-muted text-xs">sem foto</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
