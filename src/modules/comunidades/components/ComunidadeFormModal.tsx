'use client';

import { useState, useEffect } from 'react';
import { FormModal } from '@/components/FormModal/FormModal';
import { useSessao } from '@/contexts/SessaoContext';
import {
  criarComunidade,
  atualizarComunidade,
} from '../services/comunidadesService';
import { listarAssessores } from '@/modules/assessores/services/assessoresService';
import type { Comunidade, Assessor, StatusComunidade } from '@/types/electron';

interface ComunidadeFormModalProps {
  aberto: boolean;
  comunidade?: Comunidade | null;
  onFechar: () => void;
  onSalvo: () => void;
}

function paraInputDate(valor: Date | string | null | undefined): string {
  if (!valor) return '';
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toISOString().slice(0, 10);
}

export function ComunidadeFormModal({
  aberto,
  comunidade,
  onFechar,
  onSalvo,
}: ComunidadeFormModalProps) {
  const { usuario } = useSessao();

  const [nome, setNome] = useState(comunidade?.nome ?? '');
  const [bairro, setBairro] = useState(comunidade?.bairro ?? '');
  const [descricaoAcao, setDescricaoAcao] = useState(
    comunidade?.descricaoAcao ?? '',
  );
  const [liderComunidade, setLiderComunidade] = useState(
    comunidade?.liderComunidade ?? '',
  );
  const [responsavelAssessorId, setResponsavelAssessorId] = useState(
    comunidade?.responsavelAssessorId ?? 0,
  );
  const [data, setData] = useState(paraInputDate(comunidade?.data));
  const [status, setStatus] = useState<StatusComunidade>(
    comunidade?.status ?? 'ABERTO',
  );
  const [dataConclusao, setDataConclusao] = useState(
    paraInputDate(comunidade?.dataConclusao),
  );

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [assessores, setAssessores] = useState<Assessor[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function carregar() {
      setCarregandoLista(true);
      try {
        const lista = await listarAssessores();
        if (!ignore) setAssessores(lista);
      } catch (e) {
        if (!ignore) setErro((e as Error).message);
      } finally {
        if (!ignore) setCarregandoLista(false);
      }
    }

    if (aberto) carregar();

    return () => {
      ignore = true;
    };
  }, [aberto]);

  const modoEdicao = !!comunidade;

  function limpar() {
    setNome('');
    setBairro('');
    setDescricaoAcao('');
    setLiderComunidade('');
    setResponsavelAssessorId(0);
    setData('');
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

    if (!bairro.trim()) {
      setErro('Bairro é obrigatório');
      return;
    }
    if (!responsavelAssessorId) {
      setErro('Selecione um responsável/assessor');
      return;
    }
    if (!data) {
      setErro('Data é obrigatória');
      return;
    }
    if (status === 'CONCLUIDO' && !dataConclusao) {
      setErro('Informe a data de conclusão');
      return;
    }

    setSalvando(true);
    setErro(null);

    const dados = {
      nome: nome.trim() || undefined,
      bairro: bairro.trim(),
      descricaoAcao: descricaoAcao.trim() || undefined,
      liderComunidade: liderComunidade.trim() || undefined,
      responsavelAssessorId,
      data,
      status,
      dataConclusao: status === 'CONCLUIDO' ? dataConclusao : undefined,
    };

    try {
      if (modoEdicao) {
        await atualizarComunidade(comunidade!.id, dados, usuario.id);
      } else {
        await criarComunidade(dados, usuario.id);
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
      titulo={modoEdicao ? 'Editar Registro' : 'Novo Registro'}
      onFechar={handleFechar}
      onSalvar={handleSalvar}
      salvando={salvando || carregandoLista}
    >
      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      <label className="text-sm">
        Nome
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Bairro *
        <input
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Líder da Comunidade
        <input
          value={liderComunidade}
          onChange={(e) => setLiderComunidade(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

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
        Responsável/Assessor *
        <select
          value={responsavelAssessorId}
          onChange={(e) => setResponsavelAssessorId(Number(e.target.value))}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        >
          <option value={0}>Selecione...</option>
          {assessores.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Descrição/Ação
        <textarea
          value={descricaoAcao}
          onChange={(e) => setDescricaoAcao(e.target.value)}
          rows={3}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Status *
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusComunidade)}
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
