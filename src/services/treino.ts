import type { RotinaExercicioDetalhada } from '@/types';
import type {
  ExercicioAtivo,
  SerieAtiva,
} from '@/stores/activeWorkoutStore';
import { buscarUltimasSeriesPorExercicios } from '@/database/repositories/historico';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function montarExerciciosAtivos(
  itens: RotinaExercicioDetalhada[]
): Promise<ExercicioAtivo[]> {
  const ids = Array.from(new Set(itens.map((i) => i.exercicio_id)));
  const ultimas = await buscarUltimasSeriesPorExercicios(ids);

  return itens.map((item) => {
    const exUid = uid('ex');
    const ultimasDoEx = ultimas.get(item.exercicio_id) ?? [];
    const numSeries = item.series_alvo ?? 3;

    const series: SerieAtiva[] = Array.from({ length: numSeries }).map(
      (_, i) => {
        const anterior = ultimasDoEx[i];
        return {
          id: uid('s'),
          numeroSerie: i + 1,
          cargaAnterior: anterior?.carga ?? null,
          repsAnteriores: anterior?.repeticoes ?? null,
          duracaoAnterior: anterior?.duracao_segundos ?? null,
          carga: '',
          reps: '',
          duracao: '',
          concluido: false,
        };
      }
    );

    return {
      id: exUid,
      exercicioId: item.exercicio_id,
      nome: item.exercicio_nome,
      grupoMuscular: item.exercicio_grupo ?? undefined,
      tipoMedicao: item.tipo_medicao,
      alternativas: item.alternativas,
      notas: item.notas,
      series,
      seriesAlvo: numSeries,
      pulado: false,
    };
  });
}
