'use client';

import { useState } from 'react';
import { FormModal } from '@/components/FormModal/FormModal';
import { useSessao } from '@/contexts/SessaoContext';
import { criarAgenda, atualizarAgenda } from '../services/agendaService';
import type { AgendaItem, StatusAgenda } from '@/types/electron';

interface AgendaFormModalProps {
  aberto: boolean;
  item?: AgendaItem | null;
  onFechar: () => void;
  onSalvo: () => void;
}

function paraInputDate(valor: Date | string | null | undefined): string {
  if (!valor) return '';
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toISOString().slice(0, 10);
}

export function AgendaFormModal({
  aberto,
  item,
  onFechar,
  onSalvo,
}: AgendaFormModalProps) {
  const { usuario } = useSessao();

  const [data, setData] = useState(paraInputDate(item?.data));
  const [nome, setNome] = useState(item?.nome ?? '');
  const [bairro, setBairro] = useState(item?.bairro ?? '');
  const [acaoCompromisso, setAcaoCompromisso] = useState(
    item?.acaoCompromisso ?? '',
  );
  const [descricao, setDescricao] = useState(item?.descricao ?? '');
  const [status, setStatus] = useState<StatusAgenda>(item?.status ?? 'ABERTO');
  const [dataConclusao, setDataConclusao] = useState(
    paraInputDate(item?.dataConclusao),
  );

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const modoEdicao = !!item;

  function limpar() {
    setData('');
    setNome('');
    setBairro('');
    setAcaoCompromisso('');
    setDescricao('');
    setStatus('ABERTO');
    setDataConclusao('');
    setErro(null);
  }

  function handleFechar() {
    limpar();
    onFechar();
  }

  async function handleSalvar() {
    if (!usuario) return;

    if (!data) {
      setErro('Data é obrigatória');
      return;
    }
    if (!acaoCompromisso.trim()) {
      setErro('Ação/Compromisso é obrigatório');
      return;
    }
    if (status === 'CONCLUIDO' && !dataConclusao) {
      setErro('Informe a data de conclusão');
      return;
    }

    setSalvando(true);
    setErro(null);

    const dados = {
      data,
      nome: nome.trim() || undefined,
      bairro: bairro.trim() || undefined,
      acaoCompromisso: acaoCompromisso.trim(),
      descricao: descricao.trim() || undefined,
      status,
      dataConclusao: status === 'CONCLUIDO' ? dataConclusao : undefined,
    };

    try {
      if (modoEdicao) {
        await atualizarAgenda(item!.id, dados, usuario.id);
      } else {
        await criarAgenda(dados, usuario.id);
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
      titulo={modoEdicao ? 'Editar Compromisso' : 'Novo Compromisso'}
      onFechar={handleFechar}
      onSalvar={handleSalvar}
      salvando={salvando}
    >
      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      <label className="text-sm">
        Data *
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Ação/Compromisso *
        <input
          value={acaoCompromisso}
          onChange={(e) => setAcaoCompromisso(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Nome
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
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

      <label className="text-sm">
        Descrição
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Status *
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusAgenda)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        >
          <option value="ABERTO">Aberto</option>
          <option value="EM_ANDAMENTO">Em andamento</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
      </label>

      {status === 'CONCLUIDO' && (
        <label className="text-sm">
          Data de Conclusão *
          <input
            type="date"
            value={dataConclusao}
            onChange={(e) => setDataConclusao(e.target.value)}
            className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          />
        </label>
      )}
    </FormModal>
  );
}
