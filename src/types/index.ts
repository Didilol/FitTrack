export type TipoMedicao = 'reps' | 'tempo';

export interface Rotina {
  id: number;
  nome: string;
  descricao: string | null;
  ordem: number;
  data_criacao: string;
}

export interface Exercicio {
  id: number;
  nome: string;
  grupo_muscular: string | null;
  instrucoes: string | null;
  tipo_medicao: TipoMedicao;
}

export interface RotinaExercicio {
  id: number;
  rotina_id: number;
  exercicio_id: number;
  ordem: number;
  series_alvo: number | null;
  reps_alvo: string | null;
  notas: string | null;
  alternativas: string | null;
}

export interface RotinaExercicioDetalhada extends RotinaExercicio {
  exercicio_nome: string;
  exercicio_grupo: string | null;
  tipo_medicao: TipoMedicao;
}

export interface HistoricoTreino {
  id: number;
  rotina_id: number | null;
  nome_treino: string;
  data_inicio: string;
  data_fim: string | null;
  duracao_segundos: number | null;
}

export interface HistoricoSerie {
  id: number;
  historico_treino_id: number;
  exercicio_id: number;
  numero_serie: number;
  carga: number;
  repeticoes: number;
  duracao_segundos: number | null;
  concluido: number;
}

export interface MedidaCorporal {
  id: number;
  data: string;
  peso: number | null;
  braco_esquerdo: number | null;
  braco_direito: number | null;
  perna_esquerda: number | null;
  perna_direita: number | null;
  cintura: number | null;
  quadril: number | null;
  observacoes: string | null;
}

export type AnguloFoto = 'frente' | 'lado' | 'costas';

export interface FotoProgresso {
  id: number;
  data: string;
  uri: string;
  angulo: AnguloFoto;
  observacoes: string | null;
}
