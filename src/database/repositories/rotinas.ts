import { getDatabase } from '../database';
import type {
  Rotina,
  RotinaExercicio,
  RotinaExercicioDetalhada,
} from '@/types';

export async function listarRotinas(): Promise<Rotina[]> {
  const db = await getDatabase();
  return db.getAllAsync<Rotina>(
    `SELECT id, nome, descricao, ordem, data_criacao
       FROM rotinas_treino
   ORDER BY ordem ASC, data_criacao ASC`
  );
}

export async function buscarRotinaPorId(id: number): Promise<Rotina | null> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<Rotina>(
    `SELECT id, nome, descricao, ordem, data_criacao FROM rotinas_treino WHERE id = ?`,
    [id]
  );
  return r ?? null;
}

export async function reordenarRotinas(idsOrdenados: number[]): Promise<void> {
  if (idsOrdenados.length === 0) return;
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < idsOrdenados.length; i++) {
      await db.runAsync(
        `UPDATE rotinas_treino SET ordem = ? WHERE id = ?`,
        [i, idsOrdenados[i]]
      );
    }
  });
}

export async function listarExerciciosDaRotina(
  rotinaId: number
): Promise<RotinaExercicioDetalhada[]> {
  const db = await getDatabase();
  return db.getAllAsync<RotinaExercicioDetalhada>(
    `SELECT
       re.id,
       re.rotina_id,
       re.exercicio_id,
       re.ordem,
       re.series_alvo,
       re.reps_alvo,
       re.notas,
       re.alternativas,
       e.nome           AS exercicio_nome,
       e.grupo_muscular AS exercicio_grupo,
       e.tipo_medicao
     FROM rotinas_exercicios re
     JOIN exercicios e ON e.id = re.exercicio_id
     WHERE re.rotina_id = ?
     ORDER BY re.ordem ASC`,
    [rotinaId]
  );
}

export interface NovaRotinaInput {
  nome: string;
  descricao?: string | null;
  itens: Array<{
    exercicioId: number;
    seriesAlvo: number;
    repsAlvo: string;
    notas?: string | null;
    alternativas?: string | null;
  }>;
}

export async function criarRotina(input: NovaRotinaInput): Promise<number> {
  const db = await getDatabase();
  let rotinaId = 0;
  await db.withTransactionAsync(async () => {
    const max = await db.getFirstAsync<{ max_ordem: number | null }>(
      `SELECT MAX(ordem) AS max_ordem FROM rotinas_treino`
    );
    const proximaOrdem = (max?.max_ordem ?? -1) + 1;
    const res = await db.runAsync(
      `INSERT INTO rotinas_treino (nome, descricao, ordem) VALUES (?, ?, ?)`,
      [input.nome.trim(), input.descricao?.trim() || null, proximaOrdem]
    );
    rotinaId = res.lastInsertRowId;

    for (let i = 0; i < input.itens.length; i++) {
      const it = input.itens[i];
      await db.runAsync(
        `INSERT INTO rotinas_exercicios
           (rotina_id, exercicio_id, ordem, series_alvo, reps_alvo, notas, alternativas)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          rotinaId,
          it.exercicioId,
          i,
          it.seriesAlvo,
          it.repsAlvo,
          it.notas ?? null,
          it.alternativas ?? null,
        ]
      );
    }
  });
  return rotinaId;
}

export async function atualizarRotina(
  id: number,
  input: NovaRotinaInput
): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE rotinas_treino SET nome = ?, descricao = ? WHERE id = ?`,
      [input.nome.trim(), input.descricao?.trim() || null, id]
    );
    await db.runAsync(`DELETE FROM rotinas_exercicios WHERE rotina_id = ?`, [id]);
    for (let i = 0; i < input.itens.length; i++) {
      const it = input.itens[i];
      await db.runAsync(
        `INSERT INTO rotinas_exercicios
           (rotina_id, exercicio_id, ordem, series_alvo, reps_alvo, notas, alternativas)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          it.exercicioId,
          i,
          it.seriesAlvo,
          it.repsAlvo,
          it.notas ?? null,
          it.alternativas ?? null,
        ]
      );
    }
  });
}

export async function eliminarRotina(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM rotinas_treino WHERE id = ?`, [id]);
}
