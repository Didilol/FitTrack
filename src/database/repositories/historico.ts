import { getDatabase } from '../database';
import type { ExercicioAtivo } from '@/stores/activeWorkoutStore';
import type { HistoricoTreino } from '@/types';

export interface SerieAnterior {
  numero_serie: number;
  carga: number;
  repeticoes: number;
  duracao_segundos: number | null;
}

export async function gravarHistoricoTreino(input: {
  rotinaId: number | null;
  nomeTreino: string;
  dataInicioMs: number;
  dataFimMs: number;
  duracaoSegundos: number;
  exercicios: ExercicioAtivo[];
}): Promise<number> {
  const db = await getDatabase();
  let historicoId = 0;

  await db.withTransactionAsync(async () => {
    const res = await db.runAsync(
      `INSERT INTO historico_treinos
         (rotina_id, nome_treino, data_inicio, data_fim, duracao_segundos)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.rotinaId,
        input.nomeTreino,
        new Date(input.dataInicioMs).toISOString(),
        new Date(input.dataFimMs).toISOString(),
        input.duracaoSegundos,
      ]
    );
    historicoId = res.lastInsertRowId;

    for (const ex of input.exercicios) {
      if (ex.pulado) {
        await db.runAsync(
          `INSERT INTO historico_series
             (historico_treino_id, exercicio_id, numero_serie,
              carga, repeticoes, duracao_segundos, concluido, status)
           VALUES (?, ?, 0, 0, 0, NULL, 0, 'skipped')`,
          [historicoId, ex.exercicioId]
        );
        continue;
      }
      const seriesConcluidas = ex.series.filter((s) => s.concluido);
      for (const s of seriesConcluidas) {
        const carga = parseFloat(s.carga.replace(',', '.')) || 0;
        const reps = parseInt(s.reps, 10) || 0;
        const duracao = parseFloat(s.duracao.replace(',', '.')) || null;

        await db.runAsync(
          `INSERT INTO historico_series
             (historico_treino_id, exercicio_id, numero_serie,
              carga, repeticoes, duracao_segundos, concluido, status)
           VALUES (?, ?, ?, ?, ?, ?, 1, 'completed')`,
          [
            historicoId,
            ex.exercicioId,
            s.numeroSerie,
            carga,
            reps,
            ex.tipoMedicao === 'tempo' ? duracao : null,
          ]
        );
      }
    }
  });

  return historicoId;
}

export async function buscarUltimasSeriesPorExercicios(
  exercicioIds: number[]
): Promise<Map<number, SerieAnterior[]>> {
  if (exercicioIds.length === 0) return new Map();
  const db = await getDatabase();
  const placeholders = exercicioIds.map(() => '?').join(',');

  const rows = await db.getAllAsync<{
    exercicio_id: number;
    numero_serie: number;
    carga: number;
    repeticoes: number;
    duracao_segundos: number | null;
  }>(
    `SELECT hs.exercicio_id, hs.numero_serie, hs.carga,
            hs.repeticoes, hs.duracao_segundos
       FROM historico_series hs
      WHERE (hs.exercicio_id, hs.historico_treino_id) IN (
              SELECT exercicio_id, MAX(historico_treino_id)
                FROM historico_series
               WHERE exercicio_id IN (${placeholders})
                 AND concluido = 1
               GROUP BY exercicio_id
            )
      ORDER BY hs.exercicio_id, hs.numero_serie ASC`,
    exercicioIds
  );

  const mapa = new Map<number, SerieAnterior[]>();
  for (const r of rows) {
    const lista = mapa.get(r.exercicio_id) ?? [];
    lista.push({
      numero_serie: r.numero_serie,
      carga: r.carga,
      repeticoes: r.repeticoes,
      duracao_segundos: r.duracao_segundos,
    });
    mapa.set(r.exercicio_id, lista);
  }
  return mapa;
}

export async function listarHistorico(): Promise<HistoricoTreino[]> {
  const db = await getDatabase();
  return db.getAllAsync<HistoricoTreino>(
    `SELECT id, rotina_id, nome_treino, data_inicio, data_fim, duracao_segundos
       FROM historico_treinos
   ORDER BY data_inicio DESC`
  );
}

export async function buscarTreinoPorId(
  id: number
): Promise<HistoricoTreino | null> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<HistoricoTreino>(
    `SELECT id, rotina_id, nome_treino, data_inicio, data_fim, duracao_segundos
       FROM historico_treinos WHERE id = ?`,
    [id]
  );
  return r ?? null;
}

export interface SerieDoTreino {
  exercicio_id: number;
  exercicio_nome: string;
  tipo_medicao: 'reps' | 'tempo';
  numero_serie: number;
  carga: number;
  repeticoes: number;
  duracao_segundos: number | null;
}

export async function buscarSeriesDoTreino(
  treinoId: number
): Promise<SerieDoTreino[]> {
  const db = await getDatabase();
  return db.getAllAsync<SerieDoTreino>(
    `SELECT hs.exercicio_id, hs.numero_serie, hs.carga,
            hs.repeticoes, hs.duracao_segundos,
            e.nome AS exercicio_nome, e.tipo_medicao
       FROM historico_series hs
       JOIN exercicios e ON e.id = hs.exercicio_id
      WHERE hs.historico_treino_id = ? AND hs.concluido = 1
      ORDER BY hs.exercicio_id, hs.numero_serie ASC`,
    [treinoId]
  );
}

export interface PontoProgressao {
  treino_id: number;
  data_inicio: string;
  carga_max: number;
  reps_max: number;
  volume: number;
  tempo_total: number | null;
}

export async function progressaoExercicio(
  exercicioId: number
): Promise<PontoProgressao[]> {
  const db = await getDatabase();
  return db.getAllAsync<PontoProgressao>(
    `SELECT
       ht.id   AS treino_id,
       ht.data_inicio,
       COALESCE(MAX(hs.carga), 0)                       AS carga_max,
       COALESCE(MAX(hs.repeticoes), 0)                  AS reps_max,
       COALESCE(SUM(hs.carga * hs.repeticoes), 0)       AS volume,
       SUM(hs.duracao_segundos)                         AS tempo_total
     FROM historico_series hs
     JOIN historico_treinos ht ON ht.id = hs.historico_treino_id
     WHERE hs.exercicio_id = ? AND hs.concluido = 1
     GROUP BY ht.id
     ORDER BY ht.data_inicio ASC`,
    [exercicioId]
  );
}

export async function listarExerciciosComHistorico(): Promise<
  Array<{ id: number; nome: string; grupo_muscular: string | null; tipo_medicao: 'reps' | 'tempo'; total_series: number }>
> {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT e.id, e.nome, e.grupo_muscular, e.tipo_medicao,
            COUNT(hs.id) AS total_series
       FROM exercicios e
       JOIN historico_series hs ON hs.exercicio_id = e.id
      WHERE hs.concluido = 1
      GROUP BY e.id
      ORDER BY e.grupo_muscular, e.nome`
  );
}
