import * as SQLite from 'expo-sqlite';
import { DDL, SCHEMA_VERSION } from './schema';
import { seedRotinaPadrao } from './seeds/rotinaPadrao';

const DB_NAME = 'fittrack.db';
let _db: SQLite.SQLiteDatabase | null = null;
let _initPromise: Promise<void> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  return _db;
}

export async function initDatabase(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const db = await getDatabase();
    await db.execAsync(DDL);
    await applyMigrations(db);
    await seedRotinaPadrao(db);
  })();
  return _initPromise;
}

async function applyMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _schema_version (version INTEGER PRIMARY KEY);
  `);
  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM _schema_version LIMIT 1'
  );
  const current = row?.version ?? 0;
  if (current === SCHEMA_VERSION) return;
  await db.runAsync(
    'INSERT OR REPLACE INTO _schema_version (version) VALUES (?)',
    [SCHEMA_VERSION]
  );
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DROP TABLE IF EXISTS historico_series;
    DROP TABLE IF EXISTS historico_treinos;
    DROP TABLE IF EXISTS rotinas_exercicios;
    DROP TABLE IF EXISTS rotinas_treino;
    DROP TABLE IF EXISTS fotos_progresso;
    DROP TABLE IF EXISTS medidas_corporais;
    DROP TABLE IF EXISTS exercicios;
    DROP TABLE IF EXISTS usuarios;
    DROP TABLE IF EXISTS _schema_version;
  `);
  _initPromise = null;
  await initDatabase();
}
