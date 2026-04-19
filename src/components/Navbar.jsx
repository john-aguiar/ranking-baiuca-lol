
'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-slate-800 p-4 flex gap-4 flex-wrap text-white">
      <Link href="/">🏆 Ranking</Link>
      <Link href="/players">👤 Jogadores</Link>
      <Link href="/matches">🎮 Partidas</Link>
      <Link href="/history">🕘 Histórico</Link>
    </nav>
  )
}
