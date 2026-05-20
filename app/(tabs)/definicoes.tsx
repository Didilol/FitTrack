import { useState } from 'react';
import { ScrollView, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSettingsStore } from '@/stores/settingsStore';
import { resetDatabase } from '@/database/database';
import {
  escolherFicheiroBackup,
  exportarBackup,
  importarBackup,
  partilharBackup,
} from '@/services/backup';

export default function DefinicoesScreen() {
  const duracao = useSettingsStore((s) => s.duracaoDescansoPadrao);
  const setDuracao = useSettingsStore((s) => s.setDuracaoDescansoPadrao);
  const [aExportar, setAExportar] = useState(false);
  const [aImportar, setAImportar] = useState(false);

  async function exportar() {
    setAExportar(true);
    try {
      const { uri, tamanhoBytes, totalRegistos } = await exportarBackup();
      await partilharBackup(uri);
      Alert.alert(
        'Backup exportado',
        `${totalRegistos} registo${totalRegistos === 1 ? '' : 's'} • ${(
          tamanhoBytes / 1024
        ).toFixed(1)} KB`
      );
    } catch (e) {
      Alert.alert(
        'Falha a exportar',
        e instanceof Error ? e.message : 'Erro desconhecido'
      );
    } finally {
      setAExportar(false);
    }
  }

  async function importar() {
    const ficheiro = await escolherFicheiroBackup();
    if (!ficheiro) return;

    Alert.alert(
      'Importar backup?',
      'Isto vai SUBSTITUIR todos os dados atuais. Não tem volta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Substituir tudo',
          style: 'destructive',
          onPress: async () => {
            setAImportar(true);
            try {
              const r = await importarBackup(ficheiro);
              Alert.alert(
                'Backup restaurado',
                `${r.totalRegistos} registo${r.totalRegistos === 1 ? '' : 's'} importado${
                  r.totalRegistos === 1 ? '' : 's'
                }.`
              );
            } catch (e) {
              Alert.alert(
                'Falha a importar',
                e instanceof Error ? e.message : 'Erro desconhecido'
              );
            } finally {
              setAImportar(false);
            }
          },
        },
      ]
    );
  }

  function confirmarReset() {
    Alert.alert(
      'Reset completo',
      'Vai apagar TUDO (rotinas, histórico, medidas) e voltar à rotina padrão. Não tem volta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            Alert.alert('Pronto', 'Base de dados redefinida.');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text className="text-text text-2xl font-bold mb-2">Definições</Text>

        <Card>
          <Text className="text-text font-semibold mb-3">
            Temporizador de descanso
          </Text>
          <Input
            label="Duração padrão (segundos)"
            keyboardType="number-pad"
            value={String(duracao)}
            onChangeText={(v) => {
              const n = parseInt(v.replace(/\D/g, ''), 10);
              if (Number.isFinite(n)) setDuracao(n);
            }}
          />
        </Card>

        <Card>
          <Text className="text-text font-semibold mb-1">Backup de dados</Text>
          <Text className="text-muted text-sm mb-3">
            Exporta todas as tabelas para JSON (rotinas, histórico, medidas e
            referências de fotos — os ficheiros físicos das fotos ficam no
            telemóvel). Importa para substituir tudo a partir de um JSON.
          </Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                loading={aExportar}
                onPress={exportar}
              >
                Exportar
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                loading={aImportar}
                onPress={importar}
              >
                Importar
              </Button>
            </View>
          </View>
        </Card>

        <Card>
          <Text className="text-text font-semibold mb-1">Zona perigosa</Text>
          <Text className="text-muted text-sm mb-3">
            Apaga tudo e volta à rotina padrão.
          </Text>
          <Button variant="danger" size="md" onPress={confirmarReset}>
            Reset completo
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
