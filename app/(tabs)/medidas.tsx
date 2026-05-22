import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  eliminarMedida,
  listarMedidas,
  ultimaMedida,
} from '@/database/repositories/medidas';
import { listarFotos } from '@/database/repositories/fotos';
import { formatDataCurta, formatPeso } from '@/utils/format';
import type { FotoProgresso, MedidaCorporal } from '@/types';

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="text-muted text-[10px] uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-text text-base font-semibold mt-0.5">{value}</Text>
    </View>
  );
}

export default function MedidasScreen() {
  const router = useRouter();
  const [ultima, setUltima] = useState<MedidaCorporal | null>(null);
  const [historico, setHistorico] = useState<MedidaCorporal[]>([]);
  const [fotos, setFotos] = useState<FotoProgresso[]>([]);

  const carregar = useCallback(async () => {
    const [u, lista, listaFotos] = await Promise.all([
      ultimaMedida(),
      listarMedidas(),
      listarFotos(),
    ]);
    setUltima(u);
    setHistorico(lista);
    setFotos(listaFotos);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function confirmarEliminar(m: MedidaCorporal) {
    Alert.alert(
      'Eliminar registo?',
      `Esta medida de ${formatDataCurta(m.data)} será removida.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await eliminarMedida(m.id);
            await carregar();
          },
        },
      ]
    );
  }

  const fotosPorData = fotos.reduce<Record<string, FotoProgresso[]>>(
    (acc, f) => {
      const k = f.data.slice(0, 10);
      (acc[k] ??= []).push(f);
      return acc;
    },
    {}
  );
  const datasOrdenadas = Object.keys(fotosPorData).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}>
        <Text className="text-text text-2xl font-bold mb-2">Medidas</Text>

        <Card>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-text font-semibold">Última medida</Text>
            {ultima ? (
              <Text className="text-muted text-xs">
                {formatDataCurta(ultima.data)}
              </Text>
            ) : null}
          </View>

          {ultima ? (
            <>
              <View className="flex-row gap-2 mb-3">
                <MiniStat label="Peso" value={formatPeso(ultima.peso)} />
                <MiniStat
                  label="Cintura"
                  value={ultima.cintura ? `${ultima.cintura} cm` : '—'}
                />
                <MiniStat
                  label="Quadril"
                  value={ultima.quadril ? `${ultima.quadril} cm` : '—'}
                />
              </View>
              <View className="flex-row gap-2">
                <MiniStat
                  label="Braço esq."
                  value={ultima.braco_esquerdo ? `${ultima.braco_esquerdo} cm` : '—'}
                />
                <MiniStat
                  label="Braço dir."
                  value={ultima.braco_direito ? `${ultima.braco_direito} cm` : '—'}
                />
              </View>
              <View className="flex-row gap-2 mt-3">
                <MiniStat
                  label="Perna esq."
                  value={ultima.perna_esquerda ? `${ultima.perna_esquerda} cm` : '—'}
                />
                <MiniStat
                  label="Perna dir."
                  value={ultima.perna_direita ? `${ultima.perna_direita} cm` : '—'}
                />
              </View>
            </>
          ) : (
            <Text className="text-muted text-sm">Ainda sem registos.</Text>
          )}

          <View className="mt-4">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={() => router.push('/medidas/nova')}
            >
              + Nova medida
            </Button>
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text font-semibold">Galeria de fotos</Text>
            {datasOrdenadas.length > 1 ? (
              <Pressable onPress={() => router.push('/galeria/comparar')}>
                <Text className="text-accent text-xs font-semibold">
                  Comparar →
                </Text>
              </Pressable>
            ) : null}
          </View>

          {datasOrdenadas.length === 0 ? (
            <Text className="text-muted text-sm mb-3">
              Adiciona fotos de progresso (frente, lado, costas) para visualizar
              evolução visual.
            </Text>
          ) : (
            <View className="gap-3 mb-3">
              {datasOrdenadas.slice(0, 3).map((d) => (
                <Pressable
                  key={d}
                  onPress={() => router.push(`/galeria/${d}`)}
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-muted text-xs uppercase tracking-wider">
                      {formatDataCurta(d)}
                    </Text>
                    <Text className="text-muted text-xs">
                      {fotosPorData[d].length} foto
                      {fotosPorData[d].length === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    {fotosPorData[d].slice(0, 3).map((f) => (
                      <View
                        key={f.id}
                        className="flex-1 aspect-[3/4] rounded-lg overflow-hidden bg-surface-2 border border-border"
                      >
                        <Image
                          source={{ uri: f.uri }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                    {fotosPorData[d].length < 3 &&
                      Array.from({ length: 3 - fotosPorData[d].length }).map(
                        (_, i) => (
                          <View
                            key={`empty-${i}`}
                            className="flex-1 aspect-[3/4] rounded-lg bg-surface-2 border border-dashed border-border"
                          />
                        )
                      )}
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onPress={() => router.push('/galeria/nova')}
          >
            + Nova foto
          </Button>
        </Card>

        {historico.length > 1 ? (
          <View>
            <Text className="text-muted text-xs uppercase font-bold tracking-wider mt-4 mb-2">
              Histórico de medidas ({historico.length})
            </Text>
            <View className="gap-2">
              {historico.slice(1).map((m) => (
                <Card key={m.id}>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-text text-sm font-semibold">
                        {formatDataCurta(m.data)}
                      </Text>
                      <Text className="text-muted text-xs mt-0.5">
                        {m.peso ? `${m.peso} kg` : 'sem peso'}
                        {m.cintura ? ` · ${m.cintura} cintura` : ''}
                      </Text>
                    </View>
                    <Pressable onPress={() => confirmarEliminar(m)} hitSlop={6}>
                      <Text className="text-danger text-xs font-semibold">
                        Eliminar
                      </Text>
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
