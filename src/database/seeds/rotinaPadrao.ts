import type { SQLiteDatabase } from 'expo-sqlite';

type ExercicioSeed = {
  nome: string;
  grupoMuscular: string;
  tipoMedicao?: 'reps' | 'tempo';
};

type ItemRotinaSeed = {
  exercicio: string;
  series: number;
  reps: string;
  notas?: string;
  alternativas?: string;
};

type RotinaSeed = {
  nome: string;
  descricao?: string;
  itens: ItemRotinaSeed[];
};

const EXERCICIOS: ExercicioSeed[] = [
  { nome: 'Supino Reto',                       grupoMuscular: 'Peito' },
  { nome: 'Supino Inclinado',                  grupoMuscular: 'Peito' },
  { nome: 'Pec Deck',                          grupoMuscular: 'Peito' },
  { nome: 'Crossover',                         grupoMuscular: 'Peito' },
  { nome: 'Tríceps Pulley',                    grupoMuscular: 'Tríceps' },
  { nome: 'Tríceps Testa',                     grupoMuscular: 'Tríceps' },
  { nome: 'Tríceps Francês',                   grupoMuscular: 'Tríceps' },
  { nome: 'Gêmeos em Pé',                      grupoMuscular: 'Panturrilha' },
  { nome: 'Gêmeos Sentado',                    grupoMuscular: 'Panturrilha' },
  { nome: 'Puxada Alta Pronada',               grupoMuscular: 'Costas' },
  { nome: 'Remada Baixa Sentada',              grupoMuscular: 'Costas' },
  { nome: 'Remada Curvada',                    grupoMuscular: 'Costas' },
  { nome: 'Rosca Direta',                      grupoMuscular: 'Bíceps' },
  { nome: 'Rosca Inclinada',                   grupoMuscular: 'Bíceps' },
  { nome: 'Rosca Martelo',                     grupoMuscular: 'Bíceps' },
  { nome: 'Agachamento Livre',                 grupoMuscular: 'Pernas' },
  { nome: 'Agachamento Sumô',                  grupoMuscular: 'Pernas' },
  { nome: 'Cadeira Extensora',                 grupoMuscular: 'Pernas' },
  { nome: 'Mesa Flexora',                      grupoMuscular: 'Pernas' },
  { nome: 'Stiff',                             grupoMuscular: 'Pernas' },
  { nome: 'Desenvolvimento com Halteres',      grupoMuscular: 'Ombros' },
  { nome: 'Elevação Lateral',                  grupoMuscular: 'Ombros' },
  { nome: 'Crucifixo Invertido',               grupoMuscular: 'Ombros' },
  { nome: 'Encolhimento de Ombros',            grupoMuscular: 'Trapézio' },
  { nome: 'Prancha Abdominal',                 grupoMuscular: 'Core',         tipoMedicao: 'tempo' },
  { nome: 'Alongamento Peitoral no Batente',   grupoMuscular: 'Alongamento',  tipoMedicao: 'tempo' },
  { nome: 'Alongamento Flexores de Quadril',   grupoMuscular: 'Alongamento',  tipoMedicao: 'tempo' },
  { nome: 'Alongamento Posterior',             grupoMuscular: 'Alongamento',  tipoMedicao: 'tempo' },
  { nome: 'Postura da Criança',                grupoMuscular: 'Alongamento',  tipoMedicao: 'tempo' },
];

const ROTINAS: RotinaSeed[] = [
  {
    nome: 'Treino A — Peito, Tríceps e Panturrilha',
    itens: [
      { exercicio: 'Supino Reto',      series: 4, reps: '8-12',  alternativas: 'Halteres,Barra' },
      { exercicio: 'Supino Inclinado', series: 3, reps: '8-12',  alternativas: 'Halteres,Máquina' },
      { exercicio: 'Pec Deck',         series: 3, reps: '10-12', alternativas: 'Pec Deck,Crossover' },
      { exercicio: 'Tríceps Pulley',   series: 3, reps: '10-12', alternativas: 'Barra reta,Barra W' },
      { exercicio: 'Tríceps Testa',    series: 3, reps: '8-12',  alternativas: 'Tríceps Testa,Tríceps Francês' },
      { exercicio: 'Gêmeos em Pé',     series: 4, reps: '12-15', alternativas: 'Máquina,Leg Press', notas: '2s de isometria no topo' },
    ],
  },
  {
    nome: 'Treino B — Costas e Bíceps',
    itens: [
      { exercicio: 'Puxada Alta Pronada',  series: 4, reps: '8-12'  },
      { exercicio: 'Remada Baixa Sentada', series: 3, reps: '10-12', notas: 'Pegada triângulo' },
      { exercicio: 'Remada Curvada',       series: 3, reps: '8-10',  alternativas: 'Barra,Halteres', notas: 'Cuidado rigoroso com a postura' },
      { exercicio: 'Rosca Direta',         series: 3, reps: '8-10',  notas: 'Barra W' },
      { exercicio: 'Rosca Inclinada',      series: 3, reps: '10-12', notas: 'Banco 45°. Cotovelos fixos atrás da linha do tronco' },
      { exercicio: 'Rosca Martelo',        series: 3, reps: '10-12', notas: 'Halteres. Trabalho sinérgico de bíceps e antebraço' },
    ],
  },
  {
    nome: 'Treino C — Pernas e Glúteos',
    itens: [
      { exercicio: 'Agachamento Livre', series: 4, reps: '8-10',  alternativas: 'Agachamento Livre,Leg Press 45°' },
      { exercicio: 'Agachamento Sumô',  series: 4, reps: '10-12', notas: 'Halter pesado. Descer ao máximo mantendo alinhamento joelhos/pontas dos pés' },
      { exercicio: 'Cadeira Extensora', series: 3, reps: '10-12', notas: 'Até a falha' },
      { exercicio: 'Mesa Flexora',      series: 4, reps: '10-12', alternativas: 'Mesa Flexora,Cadeira Flexora' },
      { exercicio: 'Stiff',             series: 3, reps: '8-10',  alternativas: 'Barra,Halteres', notas: 'Foco no alongamento de posterior e glúteos' },
    ],
  },
  {
    nome: 'Treino D — Ombros, Panturrilha e Core',
    itens: [
      { exercicio: 'Desenvolvimento com Halteres', series: 4, reps: '8-12',  notas: 'Sentado' },
      { exercicio: 'Elevação Lateral',             series: 4, reps: '10-12', alternativas: 'Halteres,Polia' },
      { exercicio: 'Crucifixo Invertido',          series: 3, reps: '12',    alternativas: 'Halteres,Máquina' },
      { exercicio: 'Encolhimento de Ombros',       series: 3, reps: '12',    notas: 'Halteres' },
      { exercicio: 'Gêmeos Sentado',               series: 4, reps: '12-15', notas: 'Cavalinho' },
      { exercicio: 'Prancha Abdominal',            series: 3, reps: 'máx',   notas: 'Tempo máximo. Manter abdómen e glúteos contraídos, sem deixar a pelve cair' },
    ],
  },
  {
    nome: 'Alongamento — Correção Postural',
    descricao: 'Dias alternados (Qua/Sáb/Dom). Manter cada posição 45–60s. Foco em desfazer encurtamento de peito/ombros e flexores de quadril causados por trabalho sentado.',
    itens: [
      { exercicio: 'Alongamento Peitoral no Batente', series: 1, reps: '45-60', notas: 'Apoiar antebraços na fresta da porta e projetar o corpo para a frente' },
      { exercicio: 'Alongamento Flexores de Quadril', series: 1, reps: '45-60', notas: 'Posição de avanço/ajoelhado. Empurrar quadril para a frente — alonga o psoas' },
      { exercicio: 'Alongamento Posterior',           series: 1, reps: '45-60', notas: 'Em pé ou sentado, alcançar os pés mantendo joelhos estendidos' },
      { exercicio: 'Postura da Criança',              series: 1, reps: '45-60', notas: 'Ajoelhado, sentar nos calcanhares, esticar braços à frente' },
    ],
  },
];

export async function seedRotinaPadrao(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM rotinas_treino'
  );
  if ((row?.count ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    for (const ex of EXERCICIOS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO exercicios (nome, grupo_muscular, tipo_medicao)
         VALUES (?, ?, ?)`,
        [ex.nome, ex.grupoMuscular, ex.tipoMedicao ?? 'reps']
      );
    }

    for (const rot of ROTINAS) {
      const res = await db.runAsync(
        `INSERT INTO rotinas_treino (nome, descricao) VALUES (?, ?)`,
        [rot.nome, rot.descricao ?? null]
      );
      const rotinaId = res.lastInsertRowId;

      for (let i = 0; i < rot.itens.length; i++) {
        const item = rot.itens[i];
        const ex = await db.getFirstAsync<{ id: number }>(
          `SELECT id FROM exercicios WHERE nome = ? COLLATE NOCASE`,
          [item.exercicio]
        );
        if (!ex) continue;
        await db.runAsync(
          `INSERT INTO rotinas_exercicios
             (rotina_id, exercicio_id, ordem, series_alvo, reps_alvo, notas, alternativas)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            rotinaId,
            ex.id,
            i,
            item.series,
            item.reps,
            item.notas ?? null,
            item.alternativas ?? null,
          ]
        );
      }
    }
  });
}
