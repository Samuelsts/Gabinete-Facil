"use client";

import { useState } from "react";
import { FormModal } from "@/components/FormModal/FormModal";
import { resetarSenhaUsuarioGestao } from "../services/usuariosGestaoService";
import type { UsuarioGestao } from "@/types/electron";

interface ResetarSenhaModalProps {
  aberto: boolean;
  usuario: UsuarioGestao | null;
  onFechar: () => void;
  onSalvo: () => void;
}

export function ResetarSenhaModal({
  aberto,
  usuario,
  onFechar,
  onSalvo,
}: ResetarSenhaModalProps) {
  const [novaSenha, setNovaSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function limpar() {
    setNovaSenha("");
    setErro(null);
  }

  function handleFechar() {
    limpar();
    onFechar();
  }

  async function handleSalvar() {
    if (!usuario) return;
    if (!novaSenha.trim()) {
      setErro("Nova senha é obrigatória");
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      await resetarSenhaUsuarioGestao(usuario.id, novaSenha.trim());
      limpar();
      onSalvo();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (!usuario) return null;

  return (
    <FormModal
      aberto={aberto}
      titulo={`Resetar senha de ${usuario.nome}`}
      onFechar={handleFechar}
      onSalvar={handleSalvar}
      salvando={salvando}
    >
      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      <label className="text-sm">
        Nova senha *
        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>
    </FormModal>
  );
}