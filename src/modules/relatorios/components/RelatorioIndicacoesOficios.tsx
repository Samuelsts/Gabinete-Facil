"use client";

import { useEffect, useState } from "react";
import type {
  IndicacaoOficio,
  TipoIndicacaoOficio,
  StatusIndicacaoOficio,
  Assessor,
  DadosRelatorio,
} from "@/types/electron";
import { listarIndicacoesOficios } from "@/modules/indicacoes-oficios/services/indicacoesOficiosService";
import { listarAssessores } from "@/modules/assessores/services/assessoresService";
import { ExportButtons } from "@/components/ExportButtons/ExportButtons";

function formatarData(valor: Date | string | null): string {
  if (!valor) return "-";
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const STATUS_LABEL: Record<StatusIndicacaoOficio, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

const TIPO_LABEL: Record<TipoIndicacaoOficio, string> = {
  INDICACAO: "Indicação",
  OFICIO: "Ofício",
};

const TAMANHO_RELATORIO = 10000;

export function RelatorioIndicacoesOficios() {
  const [itens, setItens] = useState<IndicacaoOficio[]>([]);
  const [assessores, setAssessores] = useState<Assessor[]>([]);

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoIndicacaoOficio | "">("");
  const [filtroStatus, setFiltroStatus] = useState<StatusIndicacaoOficio | "">("");
  const [filtroAssessorId, setFiltroAssessorId] = useState(0);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    listarAssessores()
      .then((lista) => {
        if (!ignore) setAssessores(lista);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await listarIndicacoesOficios({
          busca: busca || undefined,
          tipo: filtroTipo || undefined,
          status: filtroStatus || undefined,
          responsavelAssessorId: filtroAssessorId || undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
          pagina: 1,
          tamanhoPagina: TAMANHO_RELATORIO,
        });
        if (!ignore) setItens(resultado.itens);
      } catch (e) {
        if (!ignore) setErro((e as Error).message);
      } finally {
        if (!ignore) setCarregando(false);
      }
    }

    run();

    return () => {
      ignore = true;
    };
  }, [busca, filtroTipo, filtroStatus, filtroAssessorId, dataInicio, dataFim]);

  function limparFiltros() {
    setBusca("");
    setFiltroTipo("");
    setFiltroStatus("");
    setFiltroAssessorId(0);
    setDataInicio("");
    setDataFim("");
  }

  function gerarDados(): DadosRelatorio {
    return {
      titulo: "Relatório de Indicações e Ofícios",
      colunas: [
        { chave: "tipo", label: "Tipo" },
        { chave: "protocolo", label: "Protocolo" },
        { chave: "destinatario", label: "Destinatário" },
        { chave: "data", label: "Data" },
        { chave: "responsavel", label: "Responsável" },
        { chave: "descricao", label: "Descrição" },
        { chave: "status", label: "Status" },
      ],
      linhas: itens.map((item) => ({
        tipo: TIPO_LABEL[item.tipo],
        protocolo: item.numeroProtocolo ?? "-",
        destinatario: item.destinatario ?? "-",
        data: formatarData(item.dataRegistro),
        responsavel: item.responsavelAssessor?.nome ?? "-",
        descricao: item.descricao ?? "-",
        status: STATUS_LABEL[item.status],
      })),
    };
  }

  return (
    <div className="text-emerald-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Relatório de Indicações e Ofícios</h1>
        <ExportButtons gerarDados={gerarDados} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <label className="text-sm">
          Buscar (destinatário/protocolo)
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          />
        </label>

        <label className="text-sm">
          Tipo
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoIndicacaoOficio | "")}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          >
            <option value="">Todos</option>
            <option value="INDICACAO">Indicação</option>
            <option value="OFICIO">Ofício</option>
          </select>
        </label>

        <label className="text-sm">
          Status
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusIndicacaoOficio | "")}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          >
            <option value="">Todos</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>
        </label>

        <label className="text-sm">
          Assessor
          <select
            value={filtroAssessorId}
            onChange={(e) => setFiltroAssessorId(Number(e.target.value))}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          >
            <option value={0}>Todos</option>
            {assessores.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          De
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          />
        </label>

        <label className="text-sm">
          Até
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          />
        </label>

        <button
          onClick={limparFiltros}
          className="text-sm text-neutral-400 hover:text-neutral-200 underline"
        >
          Limpar filtros
        </button>
      </div>

      {erro && <p className="text-red-400 mb-2">{erro}</p>}

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <>
          <p className="text-xs text-neutral-500 mb-2">{itens.length} registro(s) encontrado(s)</p>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-800">
                <th className="py-2">Tipo</th>
                <th>Protocolo</th>
                <th>Destinatário</th>
                <th>Data</th>
                <th>Responsável</th>
                <th>Descrição</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id} className="border-b border-neutral-900">
                  <td className="py-2">{TIPO_LABEL[item.tipo]}</td>
                  <td>{item.numeroProtocolo ?? "-"}</td>
                  <td>{item.destinatario ?? "-"}</td>
                  <td>{formatarData(item.dataRegistro)}</td>
                  <td>{item.responsavelAssessor?.nome ?? "-"}</td>
                  <td>{item.descricao ?? "-"}</td>
                  <td>{STATUS_LABEL[item.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}