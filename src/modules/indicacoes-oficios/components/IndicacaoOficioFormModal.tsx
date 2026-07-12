"use client";

import { useState, useEffect } from "react";
import { FormModal } from "@/components/FormModal/FormModal";
import { useSessao } from "@/contexts/SessaoContext";
import {
  criarIndicacaoOficio,
  atualizarIndicacaoOficio,
} from "../services/indicacoesOficiosService";
import {
  salvarAnexos,
  listarAnexos,
  removerAnexo,
} from "../services/anexosIndicacaoOficioService";
import { listarAssessores } from "@/modules/assessores/services/assessoresService";
import type {
  IndicacaoOficio,
  Assessor,
  TipoIndicacaoOficio,
  StatusIndicacaoOficio,
  Anexo,
} from "@/types/electron";

interface IndicacaoOficioFormModalProps {
  aberto: boolean;
  item?: IndicacaoOficio | null;
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

export function IndicacaoOficioFormModal({
  aberto,
  item,
  onFechar,
  onSalvo,
}: IndicacaoOficioFormModalProps) {
  const { usuario } = useSessao();

  const [tipo, setTipo] = useState<TipoIndicacaoOficio>(item?.tipo ?? "INDICACAO");
  const [numeroProtocolo, setNumeroProtocolo] = useState(item?.numeroProtocolo ?? "");
  const [destinatario, setDestinatario] = useState(item?.destinatario ?? "");
  const [dataRegistro, setDataRegistro] = useState(paraInputDate(item?.dataRegistro));
  const [responsavelAssessorId, setResponsavelAssessorId] = useState(
    item?.responsavelAssessorId ?? 0
  );
  const [descricao, setDescricao] = useState(item?.descricao ?? "");
  const [status, setStatus] = useState<StatusIndicacaoOficio>(item?.status ?? "ABERTO");
  const [dataConclusao, setDataConclusao] = useState(paraInputDate(item?.dataConclusao));

  const [novosArquivos, setNovosArquivos] = useState<File[]>([]);
  const [anexosExistentes, setAnexosExistentes] = useState<Anexo[]>([]);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [assessores, setAssessores] = useState<Assessor[]>([]);
  const [carregandoListas, setCarregandoListas] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function carregarDados() {
      setCarregandoListas(true);
      try {
        const [listaAssessores, listaAnexos] = await Promise.all([
          listarAssessores(),
          item ? listarAnexos(item.id) : Promise.resolve([]),
        ]);
        if (!ignore) {
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
  }, [aberto, item]);

  const modoEdicao = !!item;

  function limpar() {
    setTipo("INDICACAO");
    setNumeroProtocolo("");
    setDestinatario("");
    setDataRegistro("");
    setResponsavelAssessorId(0);
    setDescricao("");
    setStatus("ABERTO");
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

    if (!dataRegistro) {
      setErro("Data de registro é obrigatória");
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
      tipo,
      numeroProtocolo: numeroProtocolo.trim() || undefined,
      destinatario: destinatario.trim() || undefined,
      dataRegistro,
      responsavelAssessorId,
      descricao: descricao.trim() || undefined,
      status,
      dataConclusao: status === "CONCLUIDO" ? dataConclusao : undefined,
    };

    try {
      const itemSalvo = modoEdicao
        ? await atualizarIndicacaoOficio(item!.id, dados, usuario.id)
        : await criarIndicacaoOficio(dados, usuario.id);

      if (novosArquivos.length > 0 && itemSalvo) {
        await salvarAnexos(itemSalvo.id, novosArquivos);
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
      titulo={modoEdicao ? "Editar Registro" : "Novo Registro"}
      onFechar={handleFechar}
      onSalvar={handleSalvar}
      salvando={salvando || carregandoListas}
    >
      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      <label className="text-sm">
        Tipo *
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoIndicacaoOficio)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        >
          <option value="INDICACAO">Indicação</option>
          <option value="OFICIO">Ofício</option>
        </select>
      </label>

      <label className="text-sm">
        Número de Protocolo
        <input
          value={numeroProtocolo}
          onChange={(e) => setNumeroProtocolo(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Destinatário
        <input
          value={destinatario}
          onChange={(e) => setDestinatario(e.target.value)}
          className="w-full border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        />
      </label>

      <label className="text-sm">
        Data de Registro *
        <input
          type="date"
          value={dataRegistro}
          onChange={(e) => setDataRegistro(e.target.value)}
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
          onChange={(e) => setStatus(e.target.value as StatusIndicacaoOficio)}
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