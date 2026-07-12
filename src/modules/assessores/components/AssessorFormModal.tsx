"use client";

import { useState } from "react";
import { FormModal } from "@/components/FormModal/FormModal";
import { criarAssessor, atualizarAssessor } from "../services/assessoresService";
import { useSessao } from "@/contexts/SessaoContext";
import type { Assessor } from "@/types/electron";

interface AssessorFormModalProps {
  aberto: boolean;
  assessor?: Assessor | null;
  onFechar: () => void;
  onSalvo: () => void;
}

function paraInputDate(valor: Date | string | null | undefined): string {
  if (!valor) return "";
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toISOString().slice(0, 10);
}

export function AssessorFormModal({
  aberto,
  assessor,
  onFechar,
  onSalvo,
}: AssessorFormModalProps) {
  const { usuario } = useSessao();

  const [nome, setNome] = useState(assessor?.nome ?? "");
  const [celular, setCelular] = useState(assessor?.celular ?? "");
  const [endereco, setEndereco] = useState(assessor?.endereco ?? "");
  const [bairro, setBairro] = useState(assessor?.bairro ?? "");
  const [dataNascimento, setDataNascimento] = useState(
    paraInputDate(assessor?.dataNascimento)
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const modoEdicao = !!assessor;

  function limpar() {
    setNome("");
    setCelular("");
    setEndereco("");
    setBairro("");
    setDataNascimento("");
    setErro(null);
  }

  function handleFechar() {
    limpar();
    onFechar();
  }

  async function handleSalvar() {
    if (!usuario) return;

    if (!nome.trim()) {
      setErro("Nome é obrigatório");
      return;
    }

    setSalvando(true);
    setErro(null);

    const dados = {
      nome: nome.trim(),
      celular: celular.trim() || undefined,
      endereco: endereco.trim() || undefined,
      bairro: bairro.trim() || undefined,
      dataNascimento: dataNascimento || undefined,
    };

    try {
      if (modoEdicao) {
        await atualizarAssessor(assessor!.id, dados, usuario.id);
      } else {
        await criarAssessor(dados, usuario.id);
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
      titulo={modoEdicao ? "Editar Assessor" : "Novo Assessor"}
      onFechar={handleFechar}
      onSalvar={handleSalvar}
      salvando={salvando}
    >
      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      <label className="text-sm">
        Nome *
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Celular
        <input
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Data de Nascimento
        <input
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Endereço
        <input
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Bairro
        <input
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>
    </FormModal>
  );
}