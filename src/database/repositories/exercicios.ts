import { getDatabase } from '../database';
import type { Exercicio, TipoMedicao } from '@/types';

export async function listarExercicios(): Promise<Exercicio[]> {
  const db = await getDatabase();
  return db.getAllAsync<Exercicio>(
    `SELECT id, nome, grupo_muscular, instrucoes, tipo_medicao
       FROM exercicios
   ORDER BY grupo_muscular, nome`
  );
}

export async function buscarExercicioPorNome(
  nome: string
): Promise<Exercicio | null> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<Exercicio>(
    `SELECT id, nome, grupo_muscular, instrucoes, tipo_medicao
       FROM exercicios WHERE nome = ? COLLATE NOCASE`,
    [nome.trim()]
  );
  return r ?? null;
}

export async function buscarOuCriarExercicio(
  nome: string,
  opts: { grupoMuscular?: string; tipoMedicao?: TipoMedicao } = {}
): Promise<Exercicio> {
  const existente = await buscarExercicioPorNome(nome);
  if (existente) return existente;
  const db = await getDatabase();
  const res = await db.runAsync(
    `INSERT INTO exercicios (nome, grupo_muscular, tipo_medicao)
     VALUES (?, ?, ?)`,
    [nome.trim(), opts.grupoMuscular ?? null, opts.tipoMedicao ?? 'reps']
  );
  return {
    id: res.lastInsertRowId,
    nome: nome.trim(),
    grupo_muscular: opts.grupoMuscular ?? null,
    instrucoes: null,
    tipo_medicao: opts.tipoMedicao ?? 'reps',
  };
}

export async function buscarExercicioPorId(
  id: number
): Promise<Exercicio | null> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<Exercicio>(
    `SELECT id, nome, grupo_muscular, instrucoes, tipo_medicao
       FROM exercicios WHERE id = ?`,
    [id]
  );
  return r ?? null;
}
