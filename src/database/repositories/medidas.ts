import { getDatabase } from '../database';
import type { MedidaCorporal } from '@/types';

export type NovaMedidaInput = Omit<MedidaCorporal, 'id'>;

export async function listarMedidas(): Promise<MedidaCorporal[]> {
  const db = await getDatabase();
  return db.getAllAsync<MedidaCorporal>(
    `SELECT id, data, peso, braco_esquerdo, braco_direito,
            perna_esquerda, perna_direita, cintura, quadril, observacoes
       FROM medidas_corporais
   ORDER BY data DESC, id DESC`
  );
}

export async function ultimaMedida(): Promise<MedidaCorporal | null> {
  const db = await getDatabase();
  const r = await db.getFirstAsync<MedidaCorporal>(
    `SELECT id, data, peso, braco_esquerdo, braco_direito,
            perna_esquerda, perna_direita, cintura, quadril, observacoes
       FROM medidas_corporais
   ORDER BY data DESC, id DESC LIMIT 1`
  );
  return r ?? null;
}

export async function criarMedida(input: NovaMedidaInput): Promise<number> {
  const db = await getDatabase();
  const res = await db.runAsync(
    `INSERT INTO medidas_corporais
       (data, peso, braco_esquerdo, braco_direito,
        perna_esquerda, perna_direita, cintura, quadril, observacoes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.data,
      input.peso,
      input.braco_esquerdo,
      input.braco_direito,
      input.perna_esquerda,
      input.perna_direita,
      input.cintura,
      input.quadril,
      input.observacoes,
    ]
  );
  return res.lastInsertRowId;
}

export async function eliminarMedida(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM medidas_corporais WHERE id = ?`, [id]);
}
