
'use client'
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameName, setRenameName] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      const data = await apiGet('/players');
      setPlayers(data);
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
    }
  }

  async function createPlayer() {
    if (!name.trim()) return;

    try {
      await apiPost('/players', { name });
      setName('');
      loadPlayers();
    } catch (error) {
      alert('Erro ao criar jogador: ' + error.message);
    }
  }

  async function deletePlayer(id) {
    try {
      await apiDelete(`/players/${id}`);
      loadPlayers();
    } catch (error) {
      console.error('Erro ao deletar jogador:', error);
      alert('Erro ao deletar jogador: ' + error.message);
    }
  }

  async function renamePlayer() {
    if (!selectedPlayer) {
      return alert('Jogador não selecionado');
    }

    if (!renameName.trim()) {
      return alert('Informe um nome válido');
    }

    try {
      await apiPut(`/players/${selectedPlayer.id}`, { name: renameName });
      setShowRenameModal(false);
      setRenameName('');
      setSelectedPlayer(null);
      await loadPlayers();
    } catch (error) {
      console.error('Erro ao renomear jogador:', error);
      alert('Erro ao renomear jogador: ' + error.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl mb-4 font-bold">👤 Jogadores</h1>

      {/* Form */}
      <div className="flex gap-2 mb-6">
        <input
          className="p-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Nome do jogador"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <button
          className="bg-green-500 px-4 py-2 rounded font-bold hover:bg-green-600 transition"
          onClick={createPlayer}
        >
          Criar
        </button>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {players.map(p => (
          <div
            key={p.id}
            className="flex justify-between items-center bg-slate-800 p-3 rounded hover:bg-slate-700 transition"
          >
            <span className="font-medium">{p.name}</span>
            <div className="flex gap-2">
              <button
                className="bg-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-600"
                onClick={() => { 
                  setSelectedPlayer(p);
                  setRenameName(p.name);
                  setShowRenameModal(true);
                }}
              >
                Renomear
              </button>

              <button
                className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600"
                onClick={() => { 
                  setSelectedPlayer(p);
                  setShowModal(true);
                }}
              >
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

        {showModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="bg-slate-800 p-6 rounded-lg w-full max-w-sm">
                <h2 className="text-xl mb-4 font-bold text-red-400">⚠️ Confirmar exclusão</h2>
                <p className="mb-6">
                  Deseja realmente deletar <b>{selectedPlayer?.name}</b>?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="bg-gray-600 px-4 py-2 rounded"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-red-600 px-4 py-2 rounded font-bold"
                    onClick={() => {
                      deletePlayer(selectedPlayer.id);
                      setShowModal(false);
                    }}
                  >
                    Deletar
                  </button>
                </div>
              </div>
          </div>
        )}

        {showRenameModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-sm">
              <h2 className="text-xl mb-4 font-bold">✏️ Renomear Jogador</h2>
              <input
                className="p-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Novo nome"
                value={renameName}
                onChange={e => setRenameName(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-600 px-4 py-2 rounded"
                  onClick={() => setShowRenameModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-blue-500 px-4 py-2 rounded font-bold"
                  onClick={renamePlayer}
                >
                  Renomear
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
