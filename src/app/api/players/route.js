
import { NextResponse } from 'next/server';
import { db, initDb, serialize } from '@/lib/db';

export async function GET() {
  await initDb();
  try {
    const result = await db.query('SELECT * FROM players ORDER BY name');
    return NextResponse.json(serialize(result.rows));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await initDb();
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
    }

    // RETURNING id no Postgres em vez de lastInsertRowid
    const result = await db.query(
      'INSERT INTO players (name) VALUES ($1) RETURNING id',
      [name]
    );

    const newId = result.rows[0].id;

    return NextResponse.json(serialize({ 
      id: newId, 
      name 
    }));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
