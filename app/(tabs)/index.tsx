import { useEffect, useState, useCallback } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DraggableFlatList, {
  type RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { listarRotinas, reordenarRotinas } from '@/database/repositories/rotinas';
import type { Rotina } from '@/types';

const TAB_BAR_HEIGHT = 56;

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const tabBarFootprint =
    TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + 16;

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

  const onDragEnd = useCallback(async ({ data }: { data: Rotina[] }) => {
    setRotinas(data);
    try {
      await reordenarRotinas(data.map((r) => r.id));
    } catch {
      carregar();
    }
  }, [carregar]);

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Rotina>) => (
      <ScaleDecorator>
        <View style={{ marginBottom: 12 }}>
          <Pressable
            onPress={() => router.push(`/rotina/${item.id}`)}
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
                () => {}
              );
              drag();
            }}
            delayLongPress={250}
            disabled={isActive}
          >
            <Card>
              <View className="flex-row items-start">
                <View className="flex-1 pr-2">
                  <Text className="text-text text-lg font-semibold">
                    {item.nome}
                  </Text>
                  {item.descricao ? (
                    <Text
                      className="text-muted text-sm mt-1"
                      numberOfLines={2}
                    >
                      {item.descricao}
                    </Text>
                  ) : null}
                  <View className="flex-row gap-2 mt-3">
                    <View className="bg-surface-2 px-3 py-1 rounded-full">
                      <Text className="text-muted text-xs">Ver detalhe</Text>
                    </View>
                  </View>
                </View>
                <View className="w-7 h-7 items-center justify-center">
                  <Text className="text-muted text-lg">⋮⋮</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        </View>
      </ScaleDecorator>
    ),
    [router]
  );

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-text text-3xl font-bold mb-1">FitTrack</Text>
        <Text className="text-muted text-sm">
          Mantém pressionado um card para reordenar
        </Text>
      </View>

      <DraggableFlatList
        data={rotinas}
        keyExtractor={(r) => String(r.id)}
        renderItem={renderItem}
        onDragEnd={onDragEnd}
        activationDistance={8}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 8,
          paddingBottom: tabBarFootprint,
        }}
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
        ListEmptyComponent={
          <Card>
            <Text className="text-text font-semibold">Sem rotinas</Text>
            <Text className="text-muted text-sm mt-1">
              Cria a primeira rotina ou importa um treino em texto.
            </Text>
          </Card>
        }
        ListFooterComponent={
          <View className="mt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.push('/rotina/nova')}
            >
              + Nova rotina
            </Button>
          </View>
        }
      />
    </SafeAreaView>
  );
}
