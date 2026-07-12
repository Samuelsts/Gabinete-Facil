"use client";

import { useEffect, useState } from "react";
import {
  obterConfigBackup,
  salvarConfigBackup,
  executarBackupAgora,
} from "../services/backupService";

export function ConfiguracoesPage() {
  const [horario, setHorario] = useState("18:00");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [executando, setExecutando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    obterConfigBackup()
      .then((config) => {
        if (!ignore) setHorario(config.horarioDiario);
      })
      .catch((e) => {
        if (!ignore) setErro((e as Error).message);
      })
      .finally(() => {
        if (!ignore) setCarregando(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSalvarHorario() {
    setSalvando(true);
    setErro(null);
    setMensagem(null);
    try {
      await salvarConfigBackup(horario);
      setMensagem("Horário de backup diário atualizado.");
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleBackupAgora() {
    setExecutando(true);
    setErro(null);
    setMensagem(null);
    try {
      const caminho = await executarBackupAgora();
      setMensagem(`Backup criado com sucesso em: ${caminho}`);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setExecutando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;

  return (
    <div className="max-w-lg text-emerald-900">
      <h1 className="text-xl font-semibold mb-4">Configurações</h1>

      <div className="border border-neutral-800 rounded-lg p-5">
        <h2 className="font-semibold mb-1">Backup</h2>
        <p className="text-sm text-neutral-500 mb-4">
          O sistema realiza backup automaticamente uma vez por dia no horário abaixo.
        </p>

        <label className="text-sm block mb-4">
          Horário do backup diário
          <input
            type="time"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          />
        </label>

        {erro && <p className="text-red-400 text-sm mb-3">{erro}</p>}
        {mensagem && <p className="text-green-400 text-sm mb-3">{mensagem}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleSalvarHorario}
            disabled={salvando}
            className="px-4 py-1.5 cursor-pointer text-white rounded bg-blue-600 hover:bg-blue-500 text-sm disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar horário"}
          </button>

          <button
            onClick={handleBackupAgora}
            disabled={executando}
            className="px-4 py-1.5 cursor-pointer rounded border border-neutral-700 hover:bg-neutral-800 text-sm disabled:opacity-50 hover:text-white"
          >
            {executando ? "Executando..." : "Fazer backup agora"}
          </button>
        </div>
      </div>
    </div>
  );
}