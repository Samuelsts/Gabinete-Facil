"use client";

import { useEffect, useState } from "react";
import type {
  Demanda,
  StatusDemanda,
  PrioridadeDemanda,
  Assessor,
  DadosRelatorio,
} from "@/types/electron";
import { listarDemandas } from "@/modules/demandas/services/demandasService";
import { listarAssessores } from "@/modules/assessores/services/assessoresService";
import { ExportButtons } from "@/components/ExportButtons/ExportButtons";

function formatarData(valor: Date | string | null): string {
  if (!valor) return "-";
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const STATUS_LABEL: Record<StatusDemanda, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

const PRIORIDADE_LABEL: Record<PrioridadeDemanda, string> = {
  ALTA: "Alta",
  NORMAL: "Normal",
  BAIXA: "Baixa",
};
const PRIORIDADE_COR: Record<PrioridadeDemanda, string> = {
  ALTA: "text-red-400",
  NORMAL: "text-emerald-900",
  BAIXA: "text-neutral-500",
};

const TAMANHO_RELATORIO = 10000;

export function RelatorioDemandas() {
  const [itens, setItens] = useState<Demanda[]>([]);
  const [assessores, setAssessores] = useState<Assessor[]>([]);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusDemanda | "">("");
  const [filtroPrioridade, setFiltroPrioridade] = useState<PrioridadeDemanda | "">("");
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
        const resultado = await listarDemandas({
          busca: busca || undefined,
          status: filtroStatus || undefined,
          prioridade: filtroPrioridade || undefined,
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
  }, [busca, filtroStatus, filtroPrioridade, filtroAssessorId, dataInicio, dataFim]);

  function limparFiltros() {
    setBusca("");
    setFiltroStatus("");
    setFiltroPrioridade("");
    setFiltroAssessorId(0);
    setDataInicio("");
    setDataFim("");
  }

  function gerarDados(): DadosRelatorio {
    return {
      titulo: "Relatório de Demandas",
      colunas: [
        { chave: "cidadao", label: "Cidadão" },
        { chave: "data", label: "Data" },
        { chave: "responsavel", label: "Responsável" },
        { chave: "bairro", label: "Bairro" },
        { chave: "descricao", label: "Descrição" },
        { chave: "status", label: "Status" },
        { chave: "prioridade", label: "Prioridade" },
      ],
      linhas: itens.map((d) => ({
        cidadao: d.cidadao?.nome ?? "-",
        data: formatarData(d.dataAbertura),
        responsavel: d.responsavelAssessor?.nome ?? "-",
        bairro: d.bairro ?? "-",
        descricao: d.descricao ?? "-",
        status: STATUS_LABEL[d.status],
        prioridade: PRIORIDADE_LABEL[d.prioridade],
      })),
    };
  }

  return (
    <div className="text-emerald-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Relatório de Demandas</h1>
        <ExportButtons gerarDados={gerarDados} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <label className="text-sm">
          Buscar cidadão
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          />
        </label>

        <label className="text-sm">
          Status
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusDemanda | "")}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          >
            <option value="">Todos</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>
        </label>

        <label className="text-sm">
          Prioridade
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value as PrioridadeDemanda | "")}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          >
            <option value="">Todas</option>
            <option value="ALTA">Alta</option>
            <option value="NORMAL">Normal</option>
            <option value="BAIXA">Baixa</option>
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
                <th className="py-2">Cidadão</th>
                <th>Data</th>
                <th>Responsável</th>
                <th>Bairro</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Prioridade</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((d) => (
                <tr key={d.id} className="border-b border-neutral-900">
                  <td className="py-2">{d.cidadao?.nome ?? "-"}</td>
                  <td>{formatarData(d.dataAbertura)}</td>
                  <td>{d.responsavelAssessor?.nome ?? "-"}</td>
                  <td>{d.bairro ?? "-"}</td>
                  <td>{d.descricao ?? "-"}</td>
                  <td>{STATUS_LABEL[d.status]}</td>
                  <td className={PRIORIDADE_COR[d.prioridade]}>
                    {PRIORIDADE_LABEL[d.prioridade]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}