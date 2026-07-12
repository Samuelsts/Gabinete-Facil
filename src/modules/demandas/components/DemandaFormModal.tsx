"use client";

import { useState, useEffect } from "react";
import { FormModal } from "@/components/FormModal/FormModal";
import { useSessao } from "@/contexts/SessaoContext";
import { criarDemanda, atualizarDemanda } from "../services/demandasService";
import {
  salvarAnexos,
  listarAnexos,
  removerAnexo,
} from "../services/anexosDemandaService";
import { listarCidadaos } from "@/modules/cidadaos/services/cidadaosService";
import { listarAssessores } from "@/modules/assessores/services/assessoresService";
import type {
  Demanda,
  Cidadao,
  Assessor,
  StatusDemanda,
  PrioridadeDemanda,
  Anexo,
} from "@/types/electron";

interface DemandaFormModalProps {
  aberto: boolean;
  demanda?: Demanda | null;
  onFechar: () => void;
  onSalvo: () => void;
}

function paraInputDate(valor: Date | string | null | undefined): string {
  if (!valor) return "";
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toISOString().slice(0, 10);
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DemandaFormModal({
  aberto,
  demanda,
  onFechar,
  onSalvo,
}: DemandaFormModalProps) {
  const { usuario } = useSessao();

  const [cidadaoId, setCidadaoId] = useState(demanda?.cidadaoId ?? 0);
  const [bairro, setBairro] = useState(demanda?.bairro ?? "");
  const [dataAbertura, setDataAbertura] = useState(
    paraInputDate(demanda?.dataAbertura)
  );
  const [responsavelAssessorId, setResponsavelAssessorId] = useState(
    demanda?.responsavelAssessorId ?? 0
  );
  const [descricao, setDescricao] = useState(demanda?.descricao ?? "");
  const [status, setStatus] = useState<StatusDemanda>(
    demanda?.status ?? "ABERTO"
  );
  const [prioridade, setPrioridade] = useState<PrioridadeDemanda>(
    demanda?.prioridade ?? "NORMAL"
  );
  const [dataConclusao, setDataConclusao] = useState(
    paraInputDate(demanda?.dataConclusao)
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
        const [listaCidadaos, listaAssessores, listaAnexos] = await Promise.all([
          listarCidadaos(),
          listarAssessores(),
          demanda ? listarAnexos(demanda.id) : Promise.resolve([]),
        ]);
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
  }, [aberto, demanda]);

  const modoEdicao = !!demanda;

  function limpar() {
    setCidadaoId(0);
    setBairro("");
    setDataAbertura("");
    setResponsavelAssessorId(0);
    setDescricao("");
    setStatus("ABERTO");
    setPrioridade("NORMAL");
    setDataConclusao("");
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
    e.target.value = "";
  }

  function handleRemoverArquivoNovo(index: number) {
    setNovosArquivos((atual) => atual.filter((_, i) => i !== index));
  }

  async function handleRemoverAnexoExistente(anexoId: number) {
    if (!confirm("Remover este anexo?")) return;
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
      setErro("Selecione um cidadão");
      return;
    }
    if (!dataAbertura) {
      setErro("Data de abertura é obrigatória");
      return;
    }
    if (!responsavelAssessorId) {
      setErro("Selecione um responsável/assessor");
      return;
    }
    if (status === "CONCLUIDO" && !dataConclusao) {
      setErro("Informe a data de conclusão");
      return;
    }

    setSalvando(true);
    setErro(null);

    const dados = {
      cidadaoId,
      bairro: bairro.trim() || undefined,
      dataAbertura,
      responsavelAssessorId,
      descricao: descricao.trim() || undefined,
      status,
      prioridade,
      dataConclusao: status === "CONCLUIDO" ? dataConclusao : undefined,
    };

    try {
      const demandaSalva = modoEdicao
        ? await atualizarDemanda(demanda!.id, dados, usuario.id)
        : await criarDemanda(dados, usuario.id);

      if (novosArquivos.length > 0 && demandaSalva) {
        await salvarAnexos(demandaSalva.id, novosArquivos);
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
      titulo={modoEdicao ? "Editar Demanda" : "Nova Demanda"}
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
        Data de Abertura *
        <input
          type="date"
          value={dataAbertura}
          onChange={(e) => setDataAbertura(e.target.value)}
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
          onChange={(e) => setStatus(e.target.value as StatusDemanda)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        >
          <option value="ABERTO">Aberto</option>
          <option value="EM_ANDAMENTO">Em andamento</option>
          <option value="CONCLUIDO">Concluído</option>
        </select>
      </label>

      {status === "CONCLUIDO" && (
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
        Prioridade *
        <select
          value={prioridade}
          onChange={(e) => setPrioridade(e.target.value as PrioridadeDemanda)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        >
          <option value="BAIXA">Baixa</option>
          <option value="NORMAL">Normal</option>
          <option value="ALTA">Alta</option>
        </select>
      </label>

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