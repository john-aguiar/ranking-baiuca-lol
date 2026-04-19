
import { NextResponse } from 'next/server';
import { db, serialize } from '@/lib/db';

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
    }

    const result = await db.query(
      'UPDATE players SET name = $1 WHERE id = $2',
      [name, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    // Graças ao ON DELETE CASCADE no schema PostgreSQL, deletar player já remove match_players relacionados.
    const result = await db.query(
      'DELETE FROM players WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Jogador não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
