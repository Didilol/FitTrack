import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { listarRotinas } from '@/database/repositories/rotinas';
import type { Rotina } from '@/types';

export default function Dashboard() {
  const router = useRouter();
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    const lista = await listarRotinas();
    setRotinas(lista);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await carregar();
              setRefreshing(false);
            }}
            tintColor="#CCFF00"
          />
        }
      >
        <Text className="text-text text-3xl font-bold mb-1">FitTrack</Text>
        <Text className="text-muted text-sm mb-6">
          Escolhe um treino para começar
        </Text>

        <View className="gap-3">
          {rotinas.map((r) => (
            <Card
              key={r.id}
              onPress={() => router.push(`/rotina/${r.id}`)}
            >
              <Text className="text-text text-lg font-semibold">{r.nome}</Text>
              {r.descricao ? (
                <Text className="text-muted text-sm mt-1" numberOfLines={2}>
                  {r.descricao}
                </Text>
              ) : null}
              <View className="flex-row gap-2 mt-3">
                <View className="bg-surface-2 px-3 py-1 rounded-full">
                  <Text className="text-muted text-xs">Ver detalhe</Text>
                </View>
              </View>
            </Card>
          ))}

          {rotinas.length === 0 && (
            <Card>
              <Text className="text-text font-semibold">Sem rotinas</Text>
              <Text className="text-muted text-sm mt-1">
                Cria a primeira rotina ou importa um treino em texto.
              </Text>
            </Card>
          )}
        </View>

        <View className="mt-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/rotina/nova')}
          >
            + Nova rotina
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
