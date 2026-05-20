import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { criarMedida } from '@/database/repositories/medidas';
import { parseNumero } from '@/utils/format';

const CAMPOS: Array<{
  id:
    | 'peso'
    | 'braco_esquerdo'
    | 'braco_direito'
    | 'perna_esquerda'
    | 'perna_direita'
    | 'cintura'
    | 'quadril';
  label: string;
  sufixo: string;
}> = [
  { id: 'peso', label: 'Peso', sufixo: 'kg' },
  { id: 'braco_esquerdo', label: 'Braço esquerdo', sufixo: 'cm' },
  { id: 'braco_direito', label: 'Braço direito', sufixo: 'cm' },
  { id: 'perna_esquerda', label: 'Perna esquerda', sufixo: 'cm' },
  { id: 'perna_direita', label: 'Perna direita', sufixo: 'cm' },
  { id: 'cintura', label: 'Cintura', sufixo: 'cm' },
  { id: 'quadril', label: 'Quadril', sufixo: 'cm' },
];

type CampoId = (typeof CAMPOS)[number]['id'];

export default function NovaMedida() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [valores, setValores] = useState<Record<CampoId, string>>({
    peso: '',
    braco_esquerdo: '',
    braco_direito: '',
    perna_esquerda: '',
    perna_direita: '',
    cintura: '',
    quadril: '',
  });
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const algumValor = Object.values(valores).some((v) => v.trim() !== '');
    if (!algumValor) {
      Alert.alert(
        'Preenche pelo menos um valor',
        'Insere ao menos o peso ou uma das medidas.'
      );
      return;
    }
    setSalvando(true);
    try {
      const data = new Date().toISOString();
      await criarMedida({
        data,
        peso: valores.peso ? parseNumero(valores.peso) : null,
        braco_esquerdo: valores.braco_esquerdo
          ? parseNumero(valores.braco_esquerdo)
          : null,
        braco_direito: valores.braco_direito
          ? parseNumero(valores.braco_direito)
          : null,
        perna_esquerda: valores.perna_esquerda
          ? parseNumero(valores.perna_esquerda)
          : null,
        perna_direita: valores.perna_direita
          ? parseNumero(valores.perna_direita)
          : null,
        cintura: valores.cintura ? parseNumero(valores.cintura) : null,
        quadril: valores.quadril ? parseNumero(valores.quadril) : null,
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
      <Stack.Screen options={{ title: 'Nova medida' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 120 + insets.bottom,
            gap: 12,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            <Text className="text-muted text-xs uppercase tracking-wider mb-3">
              Data: hoje
            </Text>
            <View className="gap-3">
              {CAMPOS.map((c) => (
                <View key={c.id} className="flex-row items-end gap-2">
                  <View className="flex-1">
                    <Input
                      label={c.label}
                      value={valores[c.id]}
                      onChangeText={(v) =>
                        setValores((prev) => ({ ...prev, [c.id]: v }))
                      }
                      keyboardType="decimal-pad"
                      placeholder="—"
                    />
                  </View>
                  <View className="h-12 px-3 justify-center bg-surface-2 rounded-xl border border-border">
                    <Text className="text-muted text-sm">{c.sufixo}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          <Card>
            <Input
              label="Observações"
              placeholder="Energia, hidratação, momento do dia…"
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
            onPress={salvar}
          >
            Gravar medida
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
