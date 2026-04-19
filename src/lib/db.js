
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

// Usamos Pool para gerenciar as conexões no Next.js
export const db = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper para converter BigInt (comum no SQLite) para Number/String
export function serialize(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ));
}

// SQL sintaxe do PostgreSQL: SERIAL em vez de AUTOINCREMENT
export async function initDb() {
  try {
    await db.query(`
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
  } catch (e) {
    console.error("Erro ao inicializar banco de dados Postgres:", e);
  }
}
