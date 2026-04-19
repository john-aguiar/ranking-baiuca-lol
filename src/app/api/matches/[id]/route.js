
import { NextResponse } from 'next/server';
import { db, serialize } from '@/lib/db';

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const { winner } = await req.json();

    if (!['A', 'B'].includes(winner)) {
      return NextResponse.json({ error: 'Winner deve ser A ou B' }, { status: 400 });
    }

    const result = await db.query(
      'UPDATE matches SET winner = $1 WHERE id = $2',
      [winner, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Partida não encontrada' }, { status: 404 });
    }

    await db.query(
      'UPDATE match_players SET won = $1 WHERE match_id = $2 AND team = $3',
      [1, id, winner]
    );

    await db.query(
      'UPDATE match_players SET won = $1 WHERE match_id = $2 AND team != $3',
      [0, id, winner]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    const result = await db.query(
      'DELETE FROM matches WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Partida não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
