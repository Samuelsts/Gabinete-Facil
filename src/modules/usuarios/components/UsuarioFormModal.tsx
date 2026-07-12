"use client";

import { useState } from "react";
import { FormModal } from "@/components/FormModal/FormModal";
import {
  criarUsuarioGestao,
  atualizarUsuarioGestao,
} from "../services/usuariosGestaoService";
import type { UsuarioGestao, PerfilUsuario } from "@/types/electron";

interface UsuarioFormModalProps {
  aberto: boolean;
  usuario?: UsuarioGestao | null;
  onFechar: () => void;
  onSalvo: () => void;
}

export function UsuarioFormModal({
  aberto,
  usuario,
  onFechar,
  onSalvo,
}: UsuarioFormModalProps) {
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<PerfilUsuario>(usuario?.perfil ?? "VISUALIZADOR");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const modoEdicao = !!usuario;
  // Trava os campos se o usuário sendo editado é um dos 3 padrões do
  // sistema — regra de negócio definida: só é permitido inativá-los,
  // nunca alterar nome/perfil/senha por esta tela.
  const bloqueado = usuario?.usuarioPadrao ?? false;

  function limpar() {
    setNome("");
    setSenha("");
    setPerfil("VISUALIZADOR");
    setErro(null);
  }

  function handleFechar() {
    limpar();
    onFechar();
  }

  async function handleSalvar() {
    if (bloqueado) return; // proteção extra: nem tenta salvar se travado

    if (!nome.trim()) {
      setErro("Nome é obrigatório");
      return;
    }
    if (!modoEdicao && !senha.trim()) {
      setErro("Senha é obrigatória");
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      if (modoEdicao) {
        await atualizarUsuarioGestao(usuario!.id, { nome: nome.trim(), perfil });
      } else {
        await criarUsuarioGestao({ nome: nome.trim(), senha: senha.trim(), perfil });
      }
      limpar();
      onSalvo();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <FormModal
      aberto={aberto}
      titulo={modoEdicao ? "Editar Usuário" : "Novo Usuário"}
      onFechar={handleFechar}
      onSalvar={handleSalvar}
      salvando={salvando}
    >
      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      {bloqueado && (
        <p className="text-sm text-yellow-500">
          Este é um usuário padrão do sistema — não pode ser editado, apenas
          inativado.
        </p>
      )}

      <label className="text-sm text-white ">
        Nome *
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={bloqueado}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1 disabled:opacity-50"
        />
      </label>

      {!modoEdicao && (
        <label className="text-sm text-white ">
          Senha *
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          />
        </label>
      )}

      <label className="text-sm text-white ">
        Perfil *
        <select
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as PerfilUsuario)}
          disabled={bloqueado}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1 disabled:opacity-50"
        >
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="EDITOR">Editor</option>
          <option value="VISUALIZADOR">Visualizador</option>
        </select>
      </label>
    </FormModal>
  );
}