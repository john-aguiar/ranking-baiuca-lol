
'use client'
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api'

export default function Matches() {
  const [players, setPlayers] = useState([])
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [teamA, setTeamA] = useState([])
  const [teamB, setTeamB] = useState([])
  const [mode, setMode] = useState('')
  const [winner, setWinner] = useState('A')
  const [matchCreated, setMatchCreated] = useState(false)
  const [currentMatchId, setCurrentMatchId] = useState(null)

  const [matches, setMatches] = useState([])
  const currentMatch = matches.find(m => m.id === currentMatchId)

  const [showManualModal, setShowManualModal] = useState(false)
  const [manualTeamA, setManualTeamA] = useState([])
  const [manualTeamB, setManualTeamB] = useState([])
  const [manualMode, setManualMode] = useState('3x3')

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

  function togglePlayerSelection(player) {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id))
    } else {
      setSelectedPlayers([...selectedPlayers, player])
    }
  }

  const selectionLimitReached = selectedPlayers.length >= 10
  const canShuffle = selectedPlayers.length >= 6 && selectedPlayers.length <= 10 && selectedPlayers.length % 2 === 0

  async function shuffleTeams() {
    const numPlayers = selectedPlayers.length
    if (numPlayers < 6 || numPlayers > 10 || numPlayers % 2 !== 0) {
      alert('Selecione entre 6 e 10 jogadores (número par)')
      return
    }

    // Embaralhar jogadores
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5)
    
    // Dividir em dois times
    const half = numPlayers / 2
    const tA = shuffled.slice(0, half)
    const tB = shuffled.slice(half)
    setTeamA(tA)
    setTeamB(tB)

    // Definir modo baseado na quantidade
    let selectedMode = ''
    if (numPlayers === 6) selectedMode = '3x3'
    else if (numPlayers === 8) selectedMode = '4x4'
    else if (numPlayers === 10) selectedMode = '5x5'

    setMode(selectedMode)

    // Criar partida pendente
    await createPendingMatch(tA, tB, selectedMode)
  }

  async function createPendingMatch(tA, tB, selectedMode) {
    try {
      const result = await apiPost('/matches', {
        mode: selectedMode,
        teamA: tA.map(p => p.id),
        teamB: tB.map(p => p.id),
        winner: null // Pendente
      })

      setCurrentMatchId(result.matchId)
      await loadMatches()
      setMatchCreated(true)
    } catch (error) {
      alert('Erro ao criar partida pendente: ' + error.message)
    }
  }

  async function updateWinner(matchId, winner) {
    await apiPut(`/matches/${matchId}`, { winner })
    loadMatches()
  }

  async function registerWinner() {
    if (!currentMatchId) {
      alert('Nenhuma partida sorteada')
      return
    }

    try {
      await updateWinner(currentMatchId, winner)
      setCurrentMatchId(null)
      setMatchCreated(false)
      setSelectedPlayers([])
      setTeamA([])
      setTeamB([])
      setMode('')
      setWinner('A')
    } catch (error) {
      alert('Erro ao registrar vencedor: ' + error.message)
    }
  }

  async function cancelPendingMatch() {
    if (!currentMatchId) return

    try {
      await apiDelete(`/matches/${currentMatchId}`)
      setCurrentMatchId(null)
      setMatchCreated(false)
      setSelectedPlayers([])
      setTeamA([])
      setTeamB([])
      setMode('')
      setWinner('A')
      loadMatches()
    } catch (error) {
      alert('Erro ao cancelar partida: ' + error.message)
    }
  }

  async function createManualMatch() {
    if (manualTeamA.length === 0 || manualTeamB.length === 0) {
      alert('Selecione jogadores para ambos os times')
      return
    }

    try {
      await apiPost('/matches', {
        mode: manualMode,
        teamA: manualTeamA.map(p => p.id),
        teamB: manualTeamB.map(p => p.id),
        winner: null
      })

      setShowManualModal(false)
      setManualTeamA([])
      setManualTeamB([])
      loadMatches()
    } catch (error) {
      alert('Erro ao criar partida manual: ' + error.message)
    }
  }

  function toggleManualPlayer(team, player) {
    if (team === 'A') {
      if (manualTeamA.find(p => p.id === player.id)) {
        setManualTeamA(manualTeamA.filter(p => p.id !== player.id))
      } else {
        setManualTeamA([...manualTeamA, player])
      }
    } else {
      if (manualTeamB.find(p => p.id === player.id)) {
        setManualTeamB(manualTeamB.filter(p => p.id !== player.id))
      } else {
        setManualTeamB([...manualTeamB, player])
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-4 font-bold">🏆 Criar Partida</h1>

      <div className="mb-6">
        <button
          className="bg-purple-500 px-4 py-2 rounded mr-4 font-bold hover:bg-purple-600 transition"
          onClick={() => setShowManualModal(true)}
        >
          Cadastrar Manual
        </button>
      </div>

      <h2 className="text-lg mb-2 font-semibold text-gray-200">Selecione os Jogadores para o Sorteio</h2>
      <p className="text-sm text-gray-400 mb-4">
        Escolha entre 6 e 10 jogadores, com número par. Clique nos cards para selecionar ou remover.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {players.map(p => {
          const selected = selectedPlayers.some(sp => sp.id === p.id)
          const disabled = selectionLimitReached && !selected
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => togglePlayerSelection(p)}
              className={
                `rounded-lg border px-3 py-4 text-left transition-all duration-200 shadow-sm ${
                  selected
                    ? 'border-purple-400 bg-purple-600 text-white shadow-purple-500/30'
                    : disabled
                    ? 'border-slate-600 bg-slate-900 text-slate-500 cursor-not-allowed'
                    : 'border-slate-700 bg-slate-800 text-gray-100 hover:border-purple-400 hover:bg-slate-700'
                }`
              }
            >
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="mt-2 text-xs text-slate-300">
                {selected ? 'Selecionado' : disabled ? 'Limite atingido' : 'Clique para selecionar'}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-800 p-4 rounded-lg">
        <div>
          <p className="text-sm text-gray-300">Selecionados: <span className="font-semibold text-white">{selectedPlayers.length}</span></p>
          <p className="text-sm text-gray-500">
            {selectedPlayers.length < 6 && 'Faltam pelo menos 6 jogadores para sortear.'}
            {selectedPlayers.length >= 6 && selectedPlayers.length <= 10 && selectedPlayers.length % 2 === 0 && 'Pronto para sortear!'}
            {(selectedPlayers.length > 10 || selectedPlayers.length % 2 !== 0) && 'Use um número par entre 6 e 10.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map(p => (
            <span key={p.id} className="rounded-full bg-purple-700 px-3 py-1 text-xs text-white">
              {p.name}
            </span>
          ))}
          {selectedPlayers.length > 0 && (
            <button
              type="button"
              className="rounded-full bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-500"
              onClick={() => setSelectedPlayers([])}
            >
              Limpar seleção
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        className={`px-5 py-3 rounded-lg text-white font-bold transition ${canShuffle ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
        onClick={shuffleTeams}
        disabled={!canShuffle}
      >
        🎲 Sortear Times
      </button>

      {currentMatchId && teamA.length > 0 && teamB.length > 0 && (
        <div className="bg-yellow-900/40 border border-yellow-700 p-5 rounded-lg mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-yellow-400">Partida Pendente</h2>
              <p className="text-sm text-gray-300">
                {currentMatch ? new Date(currentMatch.date).toLocaleString() : 'Aguardando definição do vencedor.'}
              </p>
            </div>
            <span className="bg-yellow-500 text-black px-3 py-1 rounded font-bold">Pendente</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-800 p-4 rounded">
              <h3 className="text-lg mb-2 font-bold text-blue-400">Time A</h3>
              {teamA.map(p => <div key={p.id} className="text-sm">{p.name}</div>)}
            </div>
            <div className="bg-slate-800 p-4 rounded">
              <h3 className="text-lg mb-2 font-bold text-red-400">Time B</h3>
              {teamB.map(p => <div key={p.id} className="text-sm">{p.name}</div>)}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-black/30 p-4 rounded">
            <div className="flex items-center gap-3">
              <label className="font-bold">Vencedor:</label>
              <select
                className="text-black p-2 rounded font-medium"
                value={winner}
                onChange={e => setWinner(e.target.value)}
              >
                <option value="A">Time A</option>
                <option value="B">Time B</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="bg-blue-500 px-4 py-2 rounded font-bold hover:bg-blue-600 transition"
                onClick={registerWinner}
              >
                Registrar Vencedor
              </button>
              <button
                className="bg-red-500 px-4 py-2 rounded font-bold hover:bg-red-600 transition"
                onClick={cancelPendingMatch}
              >
                Cancelar Partida
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Manual */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl mb-4 font-bold">Cadastrar Partida Manual</h2>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">Modo:</label>
              <select
                className="bg-slate-700 border border-slate-600 text-white p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={manualMode}
                onChange={e => setManualMode(e.target.value)}
              >
                <option value="3x3">3x3</option>
                <option value="4x4">4x4</option>
                <option value="5x5">5x5</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Time A</h3>
                <div className="space-y-1">
                  {players.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={manualTeamA.some(tp => tp.id === p.id)}
                        onChange={() => toggleManualPlayer('A', p)}
                        className="rounded"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-red-400 mb-2">Time B</h3>
                <div className="space-y-1">
                  {players.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={manualTeamB.some(tp => tp.id === p.id)}
                        onChange={() => toggleManualPlayer('B', p)}
                        className="rounded"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 sticky bottom-0 bg-slate-800 pt-4">
              <button
                className="bg-gray-600 px-4 py-2 rounded font-bold"
                onClick={() => setShowManualModal(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-500 px-4 py-2 rounded font-bold hover:bg-blue-600 transition"
                onClick={createManualMatch}
              >
                Criar Partida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
