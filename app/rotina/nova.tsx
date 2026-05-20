import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { parseRotinaText, type ItemParseado } from '@/services/parser';
import { buscarOuCriarExercicio } from '@/database/repositories/exercicios';
import { criarRotina } from '@/database/repositories/rotinas';

interface ItemRascunho extends ItemParseado {
  uid: string;
}

const EXEMPLO = `Treino A: Peito, Tríceps e Panturrilha
Supino Reto (Halteres ou Barra): 4 séries x 8-12 reps.
Supino Inclinado (Halteres ou Máquina): 3 séries x 8-12 reps.
Tríceps Pulley: 3 séries x 10-12 reps.
Gêmeos em Pé (Máquina ou Leg Press): 4 séries x 12-15 reps (2s de isometria no topo).
Prancha Abdominal: 3 séries de tempo máximo.`;

export default function NovaRotina() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [textoColar, setTextoColar] = useState('');
  const [itens, setItens] = useState<ItemRascunho[]>([]);
  const [linhasIgnoradas, setLinhasIgnoradas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  function aoFazerParse() {
    const r = parseRotinaText(textoColar);
    const novos: ItemRascunho[] = r.itens.map((it, i) => ({
      ...it,
      uid: `${Date.now()}-${i}`,
    }));
    setItens((prev) => [...prev, ...novos]);
    setLinhasIgnoradas(r.linhasIgnoradas);
    setTextoColar('');
    if (novos.length === 0 && r.linhasIgnoradas.length > 0) {
      Alert.alert(
        'Sem itens reconhecidos',
        'Não consegui identificar séries x reps em nenhuma linha. Verifica o formato.'
      );
    }
  }

  function actualizarItem<K extends keyof ItemRascunho>(
    uid: string,
    campo: K,
    valor: ItemRascunho[K]
  ) {
    setItens((prev) =>
      prev.map((it) => (it.uid === uid ? { ...it, [campo]: valor } : it))
    );
  }

  function removerItem(uid: string) {
    setItens((prev) => prev.filter((it) => it.uid !== uid));
  }

  function adicionarManual() {
    setItens((prev) => [
      ...prev,
      {
        uid: `${Date.now()}-${prev.length}`,
        nome: '',
        series: 3,
        reps: '10',
        tipoMedicao: 'reps',
      },
    ]);
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Falta o nome', 'Dá um nome à rotina antes de gravar.');
      return;
    }
    const validos = itens.filter((i) => i.nome.trim().length > 0);
    if (validos.length === 0) {
      Alert.alert(
        'Sem exercícios',
        'Adiciona pelo menos um exercício antes de gravar.'
      );
      return;
    }

    setSalvando(true);
    try {
      const itensDb = await Promise.all(
        validos.map(async (it) => {
          const ex = await buscarOuCriarExercicio(it.nome, {
            tipoMedicao: it.tipoMedicao,
          });
          return {
            exercicioId: ex.id,
            seriesAlvo: it.series || 1,
            repsAlvo: it.reps || '0',
            notas: it.notas ?? null,
            alternativas: it.alternativas ?? null,
          };
        })
      );

      await criarRotina({
        nome,
        descricao: descricao || null,
        itens: itensDb,
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
            <Input
              label="Nome da rotina"
              placeholder="Ex: Treino A — Peito e Tríceps"
              value={nome}
              onChangeText={setNome}
            />
            <View className="h-3" />
            <Input
              label="Descrição (opcional)"
              placeholder="Notas, dias da semana, observações…"
              value={descricao}
              onChangeText={setDescricao}
              multiline
            />
          </Card>

          <Card>
            <Text className="text-text font-semibold mb-1">
              Importar de texto
            </Text>
            <Text className="text-muted text-xs mb-3">
              Cola a tua ficha. O parser reconhece formatos como{' '}
              <Text className="text-accent">
                "Supino Reto (Halteres ou Barra): 4 séries x 8-12 reps"
              </Text>{' '}
              e <Text className="text-accent">"3 séries de tempo máximo"</Text>.
            </Text>
            <TextInput
              multiline
              value={textoColar}
              onChangeText={setTextoColar}
              placeholder={EXEMPLO}
              placeholderTextColor={colors.muted}
              className="bg-surface-2 border border-border rounded-xl px-4 py-3 text-text"
              style={{ minHeight: 140, textAlignVertical: 'top' }}
            />
            <View className="flex-row gap-2 mt-3">
              <Button
                variant="secondary"
                size="md"
                onPress={() => setTextoColar(EXEMPLO)}
              >
                Exemplo
              </Button>
              <View className="flex-1">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={!textoColar.trim()}
                  onPress={aoFazerParse}
                >
                  Processar texto
                </Button>
              </View>
            </View>

            {linhasIgnoradas.length > 0 && (
              <View className="mt-3 bg-surface-2 rounded-lg p-3">
                <Text className="text-muted text-xs font-semibold mb-1">
                  Não foi possível interpretar:
                </Text>
                {linhasIgnoradas.slice(0, 5).map((l, i) => (
                  <Text key={i} className="text-muted text-xs">
                    • {l}
                  </Text>
                ))}
              </View>
            )}
          </Card>

          <View className="flex-row items-center justify-between mt-1 mb-1">
            <Text className="text-text font-semibold">
              Exercícios ({itens.length})
            </Text>
            <Pressable onPress={adicionarManual}>
              <Text className="text-accent text-sm font-semibold">
                + Adicionar
              </Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {itens.map((it) => (
              <Card key={it.uid}>
                <Input
                  label="Nome do exercício"
                  value={it.nome}
                  onChangeText={(v) => actualizarItem(it.uid, 'nome', v)}
                />
                <View className="flex-row gap-2 mt-3">
                  <View className="flex-1">
                    <Input
                      label="Séries"
                      keyboardType="number-pad"
                      value={String(it.series)}
                      onChangeText={(v) =>
                        actualizarItem(
                          it.uid,
                          'series',
                          parseInt(v.replace(/\D/g, ''), 10) || 0
                        )
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label={it.tipoMedicao === 'tempo' ? 'Tempo (s)' : 'Reps'}
                      value={it.reps}
                      onChangeText={(v) => actualizarItem(it.uid, 'reps', v)}
                    />
                  </View>
                </View>

                <View className="flex-row gap-2 mt-3">
                  <Pressable
                    onPress={() =>
                      actualizarItem(it.uid, 'tipoMedicao', 'reps')
                    }
                    className={[
                      'flex-1 h-10 rounded-lg items-center justify-center border',
                      it.tipoMedicao === 'reps'
                        ? 'bg-accent border-accent'
                        : 'bg-surface-2 border-border',
                    ].join(' ')}
                  >
                    <Text
                      className={
                        it.tipoMedicao === 'reps'
                          ? 'text-bg font-semibold text-sm'
                          : 'text-muted text-sm'
                      }
                    >
                      Reps
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      actualizarItem(it.uid, 'tipoMedicao', 'tempo')
                    }
                    className={[
                      'flex-1 h-10 rounded-lg items-center justify-center border',
                      it.tipoMedicao === 'tempo'
                        ? 'bg-accent border-accent'
                        : 'bg-surface-2 border-border',
                    ].join(' ')}
                  >
                    <Text
                      className={
                        it.tipoMedicao === 'tempo'
                          ? 'text-bg font-semibold text-sm'
                          : 'text-muted text-sm'
                      }
                    >
                      Tempo
                    </Text>
                  </Pressable>
                </View>

                <View className="h-3" />
                <Input
                  label="Alternativas (separadas por vírgula)"
                  placeholder="Ex: Halteres, Barra"
                  value={it.alternativas ?? ''}
                  onChangeText={(v) =>
                    actualizarItem(it.uid, 'alternativas', v || undefined)
                  }
                />
                <View className="h-3" />
                <Input
                  label="Notas"
                  placeholder="Ex: 2s isometria no topo"
                  value={it.notas ?? ''}
                  onChangeText={(v) =>
                    actualizarItem(it.uid, 'notas', v || undefined)
                  }
                  multiline
                />

                <View className="flex-row justify-end mt-3">
                  <Pressable onPress={() => removerItem(it.uid)}>
                    <Text className="text-danger text-sm font-semibold">
                      Remover
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
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
            Gravar rotina
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
