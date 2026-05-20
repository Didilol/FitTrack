import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { copiarFotoParaApp } from '@/services/photos';
import { criarFoto } from '@/database/repositories/fotos';
import type { AnguloFoto } from '@/types';

const ANGULOS: Array<{ id: AnguloFoto; label: string }> = [
  { id: 'frente', label: 'Frente' },
  { id: 'lado', label: 'Lado' },
  { id: 'costas', label: 'Costas' },
];

export default function NovaFoto() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [angulo, setAngulo] = useState<AnguloFoto>('frente');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function escolherDaGaleria() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Sem permissão',
        'Concede acesso às fotos para escolher da galeria.'
      );
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setPreviewUri(res.assets[0].uri);
    }
  }

  async function tirarFoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Sem permissão',
        'Concede acesso à câmara para tirar fotos.'
      );
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      setPreviewUri(res.assets[0].uri);
    }
  }

  async function salvar() {
    if (!previewUri) {
      Alert.alert('Escolhe uma foto', 'Tira ou seleciona da galeria primeiro.');
      return;
    }
    setSalvando(true);
    try {
      const uriPermanente = copiarFotoParaApp(previewUri);
      await criarFoto({
        data: new Date().toISOString(),
        uri: uriPermanente,
        angulo,
        observacoes: observacoes.trim() || null,
      });
      router.back();
    } catch (e) {
      Alert.alert(
        'Erro a gravar',
        e instanceof Error ? e.message : 'Erro desconhecido'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-bg">
      <Stack.Screen options={{ title: 'Nova foto' }} />
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120 + insets.bottom,
          gap: 12,
        }}
      >
        <Card>
          <Text className="text-text font-semibold mb-3">Ângulo</Text>
          <View className="flex-row gap-2">
            {ANGULOS.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setAngulo(a.id)}
                className={[
                  'flex-1 h-12 rounded-lg items-center justify-center border',
                  angulo === a.id
                    ? 'bg-accent border-accent'
                    : 'bg-surface-2 border-border',
                ].join(' ')}
              >
                <Text
                  className={
                    angulo === a.id
                      ? 'text-bg font-semibold'
                      : 'text-muted'
                  }
                >
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card>
          <Text className="text-text font-semibold mb-3">Foto</Text>
          <View className="aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 border border-border mb-3">
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-muted text-sm">
                  Sem foto selecionada
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onPress={tirarFoto}
              >
                Câmara
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onPress={escolherDaGaleria}
              >
                Galeria
              </Button>
            </View>
          </View>
        </Card>

        <Card>
          <Input
            label="Observações (opcional)"
            placeholder="Ex: pós-treino, jejum"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
          />
        </Card>
      </ScrollView>

      <View
        className="absolute left-0 right-0 bottom-0 bg-bg border-t border-border px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={salvando}
          disabled={!previewUri}
          onPress={salvar}
        >
          Gravar foto
        </Button>
      </View>
    </SafeAreaView>
  );
}
