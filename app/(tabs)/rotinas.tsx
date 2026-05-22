import { useCallback, useState } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  eliminarRotina,
  listarRotinas,
} from '@/database/repositories/rotinas';
import type { Rotina } from '@/types';

export default function RotinasScreen() {
  const router = useRouter();
  const [rotinas, setRotinas] = useState<Rotina[]>([]);

  const carregar = useCallback(async () => {
    const lista = await listarRotinas();
    setRotinas(lista);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function confirmarEliminar(r: Rotina) {
    Alert.alert(
      'Eliminar rotina',
      `Tens a certeza que queres eliminar "${r.nome}"? O histórico não é afetado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await eliminarRotina(r.id);
            await carregar();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-text text-2xl font-bold">Rotinas</Text>
          <Button
            variant="primary"
            size="sm"
            onPress={() => router.push('/rotina/nova')}
          >
            + Nova
          </Button>
        </View>

        <View className="gap-3">
          {rotinas.map((r) => (
            <Card
              key={r.id}
              onPress={() => router.push(`/rotina/${r.id}`)}
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-text text-base font-semibold">
                    {r.nome}
                  </Text>
                  {r.descricao ? (
                    <Text
                      className="text-muted text-sm mt-1"
                      numberOfLines={2}
                    >
                      {r.descricao}
                    </Text>
                  ) : null}
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  haptic={false}
                  onPress={() => confirmarEliminar(r)}
                >
                  Eliminar
                </Button>
              </View>
            </Card>
          ))}

          {rotinas.length === 0 && (
            <Card>
              <Text className="text-text font-semibold">Sem rotinas</Text>
              <Text className="text-muted text-sm mt-1">
                Cria a primeira rotina para começar a treinar.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
