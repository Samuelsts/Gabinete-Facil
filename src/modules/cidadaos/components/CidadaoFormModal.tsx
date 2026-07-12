'use client';

import { useState } from 'react';
import { FormModal } from '@/components/FormModal/FormModal';
import { criarCidadao, atualizarCidadao } from '../services/cidadaosService';
import { useSessao } from '@/contexts/SessaoContext';
import type { Cidadao } from '@/types/electron';

interface CidadaoFormModalProps {
  aberto: boolean;
  cidadao?: Cidadao | null; // presente = modo edição, ausente/null = modo criação
  onFechar: () => void;
  onSalvo: () => void;
}

// Normaliza dataNascimento para o formato "YYYY-MM-DD" que o input
// type="date" exige. O IPC do Electron usa structured clone, que
// preserva Date de verdade, mas tratamos string também por segurança
// (caso a serialização mude no futuro) e null/undefined (campo vazio).
function paraInputDate(valor: Date | string | null | undefined): string {
  if (!valor) return '';
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toISOString().slice(0, 10);
}

export function CidadaoFormModal({
  aberto,
  cidadao,
  onFechar,
  onSalvo,
}: CidadaoFormModalProps) {
  const { usuario } = useSessao();

  // Inicialização "lazy" do useState a partir da prop `cidadao`. O pai
  // controla a `key` do componente (veja CidadaosPage.tsx), forçando
  // remontagem sempre que o cidadão-alvo muda — por isso não precisamos
  // de useEffect para "sincronizar" esses valores depois.
  const [nome, setNome] = useState(cidadao?.nome ?? '');
  const [celular, setCelular] = useState(cidadao?.celular ?? '');
  const [endereco, setEndereco] = useState(cidadao?.endereco ?? '');
  const [bairro, setBairro] = useState(cidadao?.bairro ?? '');
  const [dataNascimento, setDataNascimento] = useState(
    paraInputDate(cidadao?.dataNascimento),
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const modoEdicao = !!cidadao;

  function limpar() {
    setNome('');
    setCelular('');
    setEndereco('');
    setBairro('');
    setDataNascimento('');
    setErro(null);
  }

  function handleFechar() {
    limpar();
    onFechar();
  }

  async function handleSalvar() {
    if (!usuario) return;

    // Validação de presença apenas (sem checar formato de celular,
    // por decisão explícita do projeto) — nome, celular e data de
    // nascimento são obrigatórios; endereço e bairro continuam livres.
    if (!nome.trim()) {
      setErro('Nome é obrigatório');
      return;
    }
    if (!celular.trim()) {
      setErro('Celular é obrigatório');
      return;
    }
    if (!dataNascimento) {
      setErro('Data de nascimento é obrigatória');
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
        await atualizarCidadao(cidadao!.id, dados, usuario.id);
      } else {
        await criarCidadao(dados, usuario.id);
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
      titulo={modoEdicao ? 'Editar Cidadão' : 'Novo Cidadão'}
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
          className="w-full border border-neutral-200 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Celular *
        <input
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          className="w-full border border-neutral-200 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Data de Nascimento *
        <input
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className="w-full border border-neutral-200 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Endereço
        <input
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="w-full border border-neutral-200 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Bairro
        <input
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          className="w-full border border-neutral-200 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>
    </FormModal>
  );
}
