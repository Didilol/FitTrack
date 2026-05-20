import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getDatabase } from '@/database/database';

const TABELAS = [
  'usuarios',
  'rotinas_treino',
  'exercicios',
  'rotinas_exercicios',
  'historico_treinos',
  'historico_series',
  'medidas_corporais',
  'fotos_progresso',
] as const;

type Tabela = (typeof TABELAS)[number];

export interface BackupJson {
  version: 1;
  exportedAt: string;
  app: 'fittrack-local';
  tables: Record<Tabela, Record<string, unknown>[]>;
}

export async function exportarBackup(): Promise<{
  uri: string;
  tamanhoBytes: number;
  totalRegistos: number;
}> {
  const db = await getDatabase();
  const tables = {} as BackupJson['tables'];
  let total = 0;
  for (const tabela of TABELAS) {
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM ${tabela}`
    );
    tables[tabela] = rows;
    total += rows.length;
  }

  const payload: BackupJson = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'fittrack-local',
    tables,
  };

  const json = JSON.stringify(payload, null, 2);
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `fittrack_backup_${ts}.json`;
  const ficheiro = new File(Paths.cache, filename);
  if (ficheiro.exists) ficheiro.delete();
  ficheiro.create();
  ficheiro.write(json);

  return {
    uri: ficheiro.uri,
    tamanhoBytes: json.length,
    totalRegistos: total,
  };
}

export async function partilharBackup(uri: string): Promise<void> {
  const disponivel = await Sharing.isAvailableAsync();
  if (!disponivel) {
    throw new Error('Partilha não disponível neste dispositivo.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: 'Guardar backup do FitTrack',
    UTI: 'public.json',
  });
}

export async function escolherFicheiroBackup(): Promise<File | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain'],
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets[0]) return null;
  return new File(res.assets[0].uri);
}

function validarBackup(raw: unknown): asserts raw is BackupJson {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Ficheiro inválido: não é JSON de objeto.');
  }
  const o = raw as Record<string, unknown>;
  if (o.app !== 'fittrack-local') {
    throw new Error('Este ficheiro não foi gerado pelo FitTrack.');
  }
  if (o.version !== 1) {
    throw new Error(`Versão de backup ${String(o.version)} não suportada.`);
  }
  if (!o.tables || typeof o.tables !== 'object') {
    throw new Error('Ficheiro inválido: tabelas em falta.');
  }
  for (const t of TABELAS) {
    if (!Array.isArray((o.tables as Record<string, unknown>)[t])) {
      throw new Error(`Tabela "${t}" em falta ou mal formada.`);
    }
  }
}

export async function importarBackup(ficheiro: File): Promise<{
  totalRegistos: number;
  porTabela: Record<Tabela, number>;
}> {
  const conteudo = await ficheiro.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(conteudo);
  } catch {
    throw new Error('Ficheiro corrompido — JSON inválido.');
  }
  validarBackup(parsed);

  const db = await getDatabase();
  const porTabela = {} as Record<Tabela, number>;
  let total = 0;

  await db.execAsync('PRAGMA foreign_keys = OFF;');
  try {
    await db.withTransactionAsync(async () => {
      // Limpar ordem reversa de FKs
      const ordemLimpeza: Tabela[] = [
        'historico_series',
        'historico_treinos',
        'rotinas_exercicios',
        'rotinas_treino',
        'fotos_progresso',
        'medidas_corporais',
        'exercicios',
        'usuarios',
      ];
      for (const t of ordemLimpeza) {
        await db.runAsync(`DELETE FROM ${t}`);
      }

      // Inserir na ordem de dependências
      const ordemInsert: Tabela[] = [
        'usuarios',
        'exercicios',
        'rotinas_treino',
        'rotinas_exercicios',
        'historico_treinos',
        'historico_series',
        'medidas_corporais',
        'fotos_progresso',
      ];

      for (const tabela of ordemInsert) {
        const rows = parsed.tables[tabela];
        porTabela[tabela] = rows.length;
        total += rows.length;
        for (const row of rows) {
          const cols = Object.keys(row);
          if (cols.length === 0) continue;
          const placeholders = cols.map(() => '?').join(',');
          const valores = cols.map((c) => (row as Record<string, unknown>)[c] as never);
          await db.runAsync(
            `INSERT INTO ${tabela} (${cols.join(',')}) VALUES (${placeholders})`,
            valores
          );
        }
      }
    });
  } finally {
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }

  return { totalRegistos: total, porTabela };
}
