
'use client'
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api'

export default function History() {
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [playerFilter, setPlayerFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editMatch, setEditMatch] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editWinner, setEditWinner] = useState('A')
  const [teamA, setTeamA] = useState([])
  const [teamB, setTeamB] = useState([])
  const [mode, setMode] = useState('3x3')
  const [winner, setWinner] = useState('A')

  useEffect(() => {
    loadPlayers()
    loadMatches()
  }, [])

  async function loadPlayers() {
    try {
      const data = await apiGet('/players')
      setPlayers(data)
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error)
    }
  }

  async function loadMatches() {
    try {
      const data = await apiGet('/matches')
      setMatches(data)
    } catch (error) {
      console.error('Erro ao carregar partidas:', error)
    }
  }

  function togglePlayer(team, player) {
    const teamAHas = teamA.some(p => p.id === player.id)
    const teamBHas = teamB.some(p => p.id === player.id)
    if (team === 'A') {
      if (teamAHas) {
        setTeamA(teamA.filter(p => p.id !== player.id))
      } else {
        setTeamA([...teamA, player])
        if (teamBHas) setTeamB(teamB.filter(p => p.id !== player.id))
      }
    } else {
      if (teamBHas) {
        setTeamB(teamB.filter(p => p.id !== player.id))
      } else {
        setTeamB([...teamB, player])
        if (teamAHas) setTeamA(teamA.filter(p => p.id !== player.id))
      }
    }
  }

  async function createHistory() {
    if (teamA.length === 0 || teamB.length === 0) {
      alert('Selecione jogadores para os dois times.')
      return
    }

    try {
      await apiPost('/matches', {
        mode,
        teamA: teamA.map(p => p.id),
        teamB: teamB.map(p => p.id),
        winner
      })

      setShowForm(false)
      setTeamA([])
      setTeamB([])
      setMode('3x3')
      setWinner('A')
      loadMatches()
    } catch (error) {
      alert('Erro ao salvar partida: ' + error.message)
    }
  }

  async function editMatchWinner(match) {
    setEditMatch(match)
    setEditWinner(match.winner || 'A')
    setShowEditModal(true)
  }

  async function saveEditedMatch() {
    if (!editMatch) return

    try {
      await apiPut(`/matches/${editMatch.id}`, { winner: editWinner })
      setShowEditModal(false)
      setEditMatch(null)
      loadMatches()
    } catch (error) {
      alert('Erro ao salvar alteração: ' + error.message)
    }
  }

  async function deleteMatch(matchId) {
    const confirmed = window.confirm('Tem certeza que deseja deletar esta partida?')
    if (!confirmed) return

    try {
      await apiDelete(`/matches/${matchId}`)
      loadMatches()
    } catch (error) {
      alert('Erro ao deletar partida: ' + error.message)
    }
  }

  const filteredMatches = matches.filter(match => {
    const matchDate = match.date.slice(0, 10)
    const dateOk = dateFilter ? matchDate === dateFilter : true
    const playerOk = playerFilter
      ? match.teamA.includes(playerFilter) || match.teamB.includes(playerFilter)
      : true
    return dateOk && playerOk
  })

  const completedMatches = filteredMatches.filter(m => m.status === 'completed')

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">📜 Histórico de Partidas</h1>
          <p className="text-gray-400">Acompanhe os resultados e gerencie o histórico.</p>
        </div>
        <button
          className="bg-green-500 text-black px-6 py-2 rounded font-bold hover:bg-green-600 transition"
          onClick={() => setShowForm(true)}
        >
          Nova Partida
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 bg-slate-800 p-4 rounded-lg">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase">Data</label>
          <input
            type="date"
            className="p-2 bg-slate-700 border border-slate-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-400 uppercase">Jogador</label>
          <select
            className="p-2 bg-slate-700 border border-slate-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            value={playerFilter}
            onChange={e => setPlayerFilter(e.target.value)}
          >
            <option value="">Todos os jogadores</option>
            {players.map(player => (
              <option key={player.id} value={player.name} className="bg-slate-800">{player.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {completedMatches.length > 0 ? (
          completedMatches.map(match => (
            <div key={match.id} className="bg-slate-800 border border-slate-700 p-5 rounded-lg hover:border-slate-500 transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-lg">{new Date(match.date).toLocaleDateString()} <span className="text-sm font-normal text-gray-400 ml-2">{new Date(match.date).toLocaleTimeString()}</span></p>
                  <p className="text-sm bg-slate-700 inline-block px-2 py-0.5 rounded mt-1">Modo: {match.mode}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Vencedor</span>
                  <span className={`font-bold px-3 py-1 rounded ${match.winner === 'A' ? 'bg-blue-600' : 'bg-red-600'}`}>
                    Time {match.winner}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-black/20 p-4 rounded-lg">
                <div>
                  <h3 className="font-bold text-blue-400 mb-2 text-sm uppercase tracking-wider">Time A</h3>
                  <div className="space-y-1">
                    {match.teamA.map(player => (
                      <p key={player} className="text-sm">{player}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-red-400 mb-2 text-sm uppercase tracking-wider">Time B</h3>
                  <div className="space-y-1">
                    {match.teamB.map(player => (
                      <p key={player} className="text-sm">{player}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-slate-700 pt-4">
                <button
                  className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded transition"
                  onClick={() => editMatchWinner(match)}
                >
                  Editar Vencedor
                </button>
                <button
                  className="text-sm bg-red-900/50 hover:bg-red-800 text-red-200 px-4 py-2 rounded transition"
                  onClick={() => deleteMatch(match.id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-dashed border-slate-600">
            <p className="text-gray-400">Nenhuma partida encontrada com os filtros selecionados.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Registrar Nova Partida</h2>
              <button
                className="text-gray-400 hover:text-white text-2xl"
                onClick={() => setShowForm(false)}
              >
                &times;
              </button>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-bold text-sm uppercase text-gray-400 tracking-wider">Modo de Jogo</label>
              <select
                className="p-3 text-black w-full rounded font-medium"
                value={mode}
                onChange={e => setMode(e.target.value)}
              >
                <option value="3x3">3x3</option>
                <option value="4x4">4x4</option>
                <option value="5x5">5x5</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                <h3 className="font-bold text-blue-400 mb-3 uppercase text-xs tracking-widest">Time A</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                  {players.map(player => (
                    <label key={player.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-white p-1 rounded hover:bg-blue-900/20">
                      <input
                        type="checkbox"
                        checked={teamA.some(p => p.id === player.id)}
                        onChange={() => togglePlayer('A', player)}
                        className="rounded"
                      />
                      <span>{player.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-red-900/20 p-4 rounded-lg border border-red-900/30">
                <h3 className="font-bold text-red-400 mb-3 uppercase text-xs tracking-widest">Time B</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                  {players.map(player => (
                    <label key={player.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-white p-1 rounded hover:bg-red-900/20">
                      <input
                        type="checkbox"
                        checked={teamB.some(p => p.id === player.id)}
                        onChange={() => togglePlayer('B', player)}
                        className="rounded"
                      />
                      <span>{player.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block mb-2 font-bold text-sm uppercase text-gray-400 tracking-wider">Vencedor</label>
              <select
                className="p-3 text-black w-full rounded font-bold"
                value={winner}
                onChange={e => setWinner(e.target.value)}
              >
                <option value="A">Time A</option>
                <option value="B">Time B</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 sticky bottom-0 bg-slate-800 pt-4 border-t border-slate-700">
              <button
                className="bg-gray-600 px-6 py-2 rounded font-bold"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-600 px-6 py-2 rounded font-bold hover:bg-blue-500 transition"
                onClick={createHistory}
              >
                Salvar Partida
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editMatch && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Editar Vencedor</h2>
            <p className="text-gray-400 text-sm mb-6">Altere o vencedor para atualizar o ranking.</p>

            <div className="mb-6 bg-black/20 p-4 rounded-lg">
              <p className="text-sm font-bold text-gray-300 mb-1">{new Date(editMatch.date).toLocaleString()}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Modo {editMatch.mode}</p>
            </div>

            <div className="mb-8">
              <label className="block mb-2 font-bold text-sm uppercase text-gray-400 tracking-wider">Vencedor</label>
              <select
                className="p-3 bg-slate-700 border border-slate-600 text-white w-full rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editWinner}
                onChange={e => setEditWinner(e.target.value)}
              >
                <option value="A">Time A</option>
                <option value="B">Time B</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-600 px-4 py-2 rounded font-bold"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-500 transition"
                onClick={saveEditedMatch}
              >
                Salvar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
