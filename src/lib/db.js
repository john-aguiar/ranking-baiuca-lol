
import { Pool } from 'pg';

// Limpa a string de conexão para evitar ENOTFOUND por espaços invisíveis
const connectionString = process.env.DATABASE_URL?.trim();

export const db = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Limite de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export function serialize(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

export async function initDb() {
  if (!connectionString) {
    console.error("DATABASE_URL não configurada!");
    return;
  }
  
  try {
    const client = await db.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS players (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS matches (
          id SERIAL PRIMARY KEY,
          date TEXT,
          mode TEXT,
          winner TEXT
        );

        CREATE TABLE IF NOT EXISTS match_players (
          id SERIAL PRIMARY KEY,
          match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
          player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
          team TEXT,
          won INTEGER
        );
      `);
    } finally {
      client.release();
    }
  } catch (e) {
    console.error("Erro ao inicializar banco de dados Postgres:", e.message);
  }
}
