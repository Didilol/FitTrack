export const SCHEMA_VERSION = 1;

export const DDL = `
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS usuarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT NOT NULL,
    data_criacao  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rotinas_treino (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT NOT NULL,
    descricao     TEXT,
    data_criacao  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS exercicios (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT NOT NULL UNIQUE COLLATE NOCASE,
    grupo_muscular  TEXT,
    instrucoes      TEXT,
    tipo_medicao    TEXT NOT NULL DEFAULT 'reps'
                    CHECK(tipo_medicao IN ('reps','tempo'))
  );

  CREATE TABLE IF NOT EXISTS rotinas_exercicios (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    rotina_id      INTEGER NOT NULL,
    exercicio_id   INTEGER NOT NULL,
    ordem          INTEGER NOT NULL,
    series_alvo    INTEGER,
    reps_alvo      TEXT,
    notas          TEXT,
    alternativas   TEXT,
    FOREIGN KEY (rotina_id)    REFERENCES rotinas_treino(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id)     ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS historico_treinos (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    rotina_id         INTEGER,
    nome_treino       TEXT NOT NULL,
    data_inicio       TEXT NOT NULL,
    data_fim          TEXT,
    duracao_segundos  INTEGER,
    FOREIGN KEY (rotina_id) REFERENCES rotinas_treino(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS historico_series (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    historico_treino_id   INTEGER NOT NULL,
    exercicio_id          INTEGER NOT NULL,
    numero_serie          INTEGER NOT NULL,
    carga                 REAL    NOT NULL DEFAULT 0,
    repeticoes            INTEGER NOT NULL DEFAULT 0,
    duracao_segundos      REAL,
    concluido             INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (historico_treino_id) REFERENCES historico_treinos(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id)        REFERENCES exercicios(id)        ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS medidas_corporais (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    data            TEXT NOT NULL,
    peso            REAL,
    braco_esquerdo  REAL,
    braco_direito   REAL,
    perna_esquerda  REAL,
    perna_direita   REAL,
    cintura         REAL,
    quadril         REAL,
    observacoes     TEXT
  );

  CREATE TABLE IF NOT EXISTS fotos_progresso (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    data         TEXT NOT NULL,
    uri          TEXT NOT NULL,
    angulo       TEXT NOT NULL CHECK(angulo IN ('frente','lado','costas')),
    observacoes  TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_historico_data
    ON historico_treinos(data_inicio DESC);
  CREATE INDEX IF NOT EXISTS idx_series_exercicio
    ON historico_series(exercicio_id);
  CREATE INDEX IF NOT EXISTS idx_rotinas_ex_rotina
    ON rotinas_exercicios(rotina_id, ordem);
  CREATE INDEX IF NOT EXISTS idx_fotos_data
    ON fotos_progresso(data DESC);
`;
