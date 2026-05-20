import { getDatabase } from '../database';
import { eliminarFotoLocal } from '@/services/photos';
import type { AnguloFoto, FotoProgresso } from '@/types';

export async function listarFotos(): Promise<FotoProgresso[]> {
  const db = await getDatabase();
  return db.getAllAsync<FotoProgresso>(
    `SELECT id, data, uri, angulo, observacoes
       FROM fotos_progresso
   ORDER BY data DESC, id DESC`
  );
}

export async function listarDatasComFotos(): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ data: string }>(
    `SELECT DISTINCT date(data) AS data
       FROM fotos_progresso
   ORDER BY data DESC`
  );
  return rows.map((r) => r.data);
}

export async function listarFotosPorData(
  dataIso: string
): Promise<FotoProgresso[]> {
  const db = await getDatabase();
  return db.getAllAsync<FotoProgresso>(
    `SELECT id, data, uri, angulo, observacoes
       FROM fotos_progresso
      WHERE date(data) = date(?)
   ORDER BY angulo ASC`,
    [dataIso]
  );
}

export async function criarFoto(input: {
  data: string;
  uri: string;
  angulo: AnguloFoto;
  observacoes?: string | null;
}): Promise<number> {
  const db = await getDatabase();
  const res = await db.runAsync(
    `INSERT INTO fotos_progresso (data, uri, angulo, observacoes)
     VALUES (?, ?, ?, ?)`,
    [input.data, input.uri, input.angulo, input.observacoes ?? null]
  );
  return res.lastInsertRowId;
}

export async function eliminarFoto(id: number): Promise<void> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<{ uri: string }>(
    `SELECT uri FROM fotos_progresso WHERE id = ?`,
    [id]
  );
  if (r?.uri) eliminarFotoLocal(r.uri);
  await db.runAsync(`DELETE FROM fotos_progresso WHERE id = ?`, [id]);
}
