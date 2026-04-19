
import { NextResponse } from 'next/server';
import { db, initDb, serialize } from '@/lib/db';

export async function GET() {
  await initDb();
  try {
    const playersResult = await db.query('SELECT * FROM players');
    const players = playersResult.rows;

    const ranking = await Promise.all(players.map(async (player) => {
      const matchesResult = await db.query(
        `
          SELECT m.*, mp.team
          FROM matches m
          JOIN match_players mp ON mp.match_id = m.id
          WHERE mp.player_id = $1
          ORDER BY m.id DESC
        `,
        [player.id]
      );
      const matches = matchesResult.rows;

      let wins = 0;
      let losses = 0;
      let recent = [];

      matches.forEach(match => {
        const win = match.winner === match.team;
        if (win) wins++;
        else losses++;
        if (recent.length < 5) {
          recent.push(win ? 'W' : 'L');
        }
      });

      return {
        id: player.id,
        name: player.name,
        wins,
        losses,
        recent
      };
    }));

    return NextResponse.json(serialize(ranking));
  } catch (error) {
    console.error("API RANKING ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
