
import { NextResponse } from 'next/server';
import { db, serialize } from '@/lib/db';

export async function GET() {
  try {
    // No PostgreSQL, o GROUP_CONCAT é STRING_AGG
    const result = await db.query(`
      SELECT 
        m.id, m.date, m.mode, m.winner,
        STRING_AGG(CASE WHEN mp.team = 'A' THEN p.name END, ',') as teamA,
        STRING_AGG(CASE WHEN mp.team = 'B' THEN p.name END, ',') as teamB
      FROM matches m
      JOIN match_players mp ON m.id = mp.match_id
      JOIN players p ON mp.player_id = p.id
      GROUP BY m.id, m.date, m.mode, m.winner
      ORDER BY m.date DESC
    `);

    const matches = result.rows.map(match => ({
      ...match,
      teamA: match.teama ? match.teama.split(',') : [],
      teamB: match.teamb ? match.teamb.split(',') : [],
      status: match.winner ? 'completed' : 'pending'
    }));

    return NextResponse.json(serialize(matches));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { mode, teamA, teamB, winner } = await req.json();

    const match = await db.query(
      'INSERT INTO matches (date, mode, winner) VALUES ($1, $2, $3) RETURNING id',
      [new Date().toISOString(), mode, winner || null]
    );

    const matchId = match.rows[0].id;

    for (const playerId of teamA) {
      await db.query(
        'INSERT INTO match_players (match_id, player_id, team, won) VALUES ($1, $2, $3, $4)',
        [matchId, playerId, 'A', winner === 'A' ? 1 : 0]
      );
    }

    for (const playerId of teamB) {
      await db.query(
        'INSERT INTO match_players (match_id, player_id, team, won) VALUES ($1, $2, $3, $4)',
        [matchId, playerId, 'B', winner === 'B' ? 1 : 0]
      );
    }

    return NextResponse.json({ message: 'Partida registrada com sucesso!', matchId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.query('DELETE FROM match_players');
    await db.query('DELETE FROM matches');
    return NextResponse.json({ success: true, message: 'Todo o histórico foi limpo!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
