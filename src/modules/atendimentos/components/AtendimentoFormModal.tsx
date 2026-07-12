'use client';

import { useState, useEffect } from 'react';
import { FormModal } from '@/components/FormModal/FormModal';
import { useSessao } from '@/contexts/SessaoContext';
import {
  criarAtendimento,
  atualizarAtendimento,
} from '../services/atendimentosService';
import {
  salvarAnexos,
  listarAnexos,
  removerAnexo,
} from '../services/anexosService';
import { listarCidadaos } from '@/modules/cidadaos/services/cidadaosService';
import { listarAssessores } from '@/modules/assessores/services/assessoresService';
import type {
  Atendimento,
  Cidadao,
  Assessor,
  StatusAtendimento,
  Anexo,
} from '@/types/electron';

interface AtendimentoFormModalProps {
  aberto: boolean;
  atendimento?: Atendimento | null;
  onFechar: () => void;
  onSalvo: () => void;
}

function paraInputDate(valor: Date | string | null | undefined): string {
  if (!valor) return '';
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toISOString().slice(0, 10);
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AtendimentoFormModal({
  aberto,
  atendimento,
  onFechar,
  onSalvo,
}: AtendimentoFormModalProps) {
  const { usuario } = useSessao();

  const [cidadaoId, setCidadaoId] = useState(atendimento?.cidadaoId ?? 0);
  const [bairro, setBairro] = useState(atendimento?.bairro ?? '');
  const [dataAtendimento, setDataAtendimento] = useState(
    paraInputDate(atendimento?.dataAtendimento),
  );
  const [responsavelAssessorId, setResponsavelAssessorId] = useState(
    atendimento?.responsavelAssessorId ?? 0,
  );
  const [descricao, setDescricao] = useState(atendimento?.descricao ?? '');
  const [status, setStatus] = useState<StatusAtendimento>(
    atendimento?.status ?? 'ABERTO',
  );
  const [dataConclusao, setDataConclusao] = useState(
    paraInputDate(atendimento?.dataConclusao),
  );

  const [novosArquivos, setNovosArquivos] = useState<File[]>([]);
  const [anexosExistentes, setAnexosExistentes] = useState<Anexo[]>([]);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [cidadaos, setCidadaos] = useState<Cidadao[]>([]);
  const [assessores, setAssessores] = useState<Assessor[]>([]);
  const [carregandoListas, setCarregandoListas] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function carregarDados() {
      setCarregandoListas(true);
      try {
        const [listaCidadaos, listaAssessores, listaAnexos] = await Promise.all(
          [
            listarCidadaos(),
            listarAssessores(),
            atendimento ? listarAnexos(atendimento.id) : Promise.resolve([]),
          ],
        );
        if (!ignore) {
          setCidadaos(listaCidadaos);
          setAssessores(listaAssessores);
          setAnexosExistentes(listaAnexos);
        }
      } catch (e) {
        if (!ignore) setErro((e as Error).message);
      } finally {
        if (!ignore) setCarregandoListas(false);
      }
    }

    if (aberto) carregarDados();

    return () => {
      ignore = true;
    };
  }, [aberto, atendimento]);

  const modoEdicao = !!atendimento;

  function limpar() {
    setCidadaoId(0);
    setBairro('');
    setDataAtendimento('');
    setResponsavelAssessorId(0);
    setDescricao('');
    setStatus('ABERTO');
    setDataConclusao('');
    setNovosArquivos([]);
    setAnexosExistentes([]);
    setErro(null);
  }

  function handleFechar() {
    limpar();
    onFechar();
  }

  function handleSelecionarArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    setNovosArquivos((atual) => [...atual, ...arquivos]);
    e.target.value = '';
  }

  function handleRemoverArquivoNovo(index: number) {
    setNovosArquivos((atual) => atual.filter((_, i) => i !== index));
  }

  async function handleRemoverAnexoExistente(anexoId: number) {
    if (!confirm('Remover este anexo?')) return;
    try {
      await removerAnexo(anexoId);
      setAnexosExistentes((atual) => atual.filter((a) => a.id !== anexoId));
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleSalvar() {
    if (!usuario) return;

    if (!cidadaoId) {
      setErro('Selecione um cidadão');
      return;
    }
    if (!dataAtendimento) {
      setErro('Data do atendimento é obrigatória');
      return;
    }
    if (!responsavelAssessorId) {
      setErro('Selecione um responsável/assessor');
      return;
    }
    if (status === 'CONCLUIDO' && !dataConclusao) {
      setErro('Informe a data de conclusão');
      return;
    }

    setSalvando(true);
    setErro(null);

    const dados = {
      cidadaoId,
      bairro: bairro.trim() || undefined,
      dataAtendimento,
      responsavelAssessorId,
      descricao: descricao.trim() || undefined,
      status,
      dataConclusao: status === 'CONCLUIDO' ? dataConclusao : undefined,
    };

    try {
      const atendimentoSalvo = modoEdicao
        ? await atualizarAtendimento(atendimento!.id, dados, usuario.id)
        : await criarAtendimento(dados, usuario.id);

      if (novosArquivos.length > 0 && atendimentoSalvo) {
        await salvarAnexos(atendimentoSalvo.id, novosArquivos);
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
      titulo={modoEdicao ? 'Editar Atendimento' : 'Novo Atendimento'}
      onFechar={handleFechar}
      onSalvar={handleSalvar}
      salvando={salvando || carregandoListas}
    >
      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      <label className="text-sm">
        Cidadão *
        <select
          value={cidadaoId}
          onChange={(e) => setCidadaoId(Number(e.target.value))}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        >
          <option value={0}>Selecione...</option>
          {cidadaos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Data do Atendimento *
        <input
          type="date"
          value={dataAtendimento}
          onChange={(e) => setDataAtendimento(e.target.value)}
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
          onChange={(e) => setStatus(e.target.value as StatusAtendimento)}
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

      <label className="text-sm">
        Anexos
        <input
          type="file"
          multiple
          onChange={handleSelecionarArquivos}
          className="w-full text-xs mt-1"
        />
      </label>

      {anexosExistentes.length > 0 && (
        <ul className="text-xs flex flex-col gap-1">
          {anexosExistentes.map((a) => (
            <li key={a.id} className="flex justify-between items-center">
              <span>
                {a.nomeArquivo} ({formatarTamanho(a.tamanho)})
              </span>
              <button
                onClick={() => handleRemoverAnexoExistente(a.id)}
                className="text-red-400 hover:text-red-300"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      {novosArquivos.length > 0 && (
        <ul className="text-xs flex flex-col gap-1">
          {novosArquivos.map((file, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>
                {file.name} ({formatarTamanho(file.size)})
              </span>
              <button
                onClick={() => handleRemoverArquivoNovo(index)}
                className="text-red-400 hover:text-red-300"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </FormModal>
  );
}
