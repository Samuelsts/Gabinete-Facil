"use client";

import { useEffect, useState } from "react";
import type {
  Comunidade,
  StatusComunidade,
  Assessor,
  DadosRelatorio,
} from "@/types/electron";
import { listarComunidades } from "@/modules/comunidades/services/comunidadesService";
import { listarAssessores } from "@/modules/assessores/services/assessoresService";
import { ExportButtons } from "@/components/ExportButtons/ExportButtons";

function formatarData(valor: Date | string | null): string {
  if (!valor) return "-";
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const STATUS_LABEL: Record<StatusComunidade, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

const TAMANHO_RELATORIO = 10000;

export function RelatorioComunidades() {
  const [itens, setItens] = useState<Comunidade[]>([]);
  const [assessores, setAssessores] = useState<Assessor[]>([]);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusComunidade | "">("");
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
        const resultado = await listarComunidades({
          busca: busca || undefined,
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
  }, [busca, filtroStatus, filtroAssessorId, dataInicio, dataFim]);

  function limparFiltros() {
    setBusca("");
    setFiltroStatus("");
    setFiltroAssessorId(0);
    setDataInicio("");
    setDataFim("");
  }

  function gerarDados(): DadosRelatorio {
    return {
      titulo: "Relatório de Comunidades",
      colunas: [
        { chave: "nome", label: "Nome" },
        { chave: "bairro", label: "Bairro" },
        { chave: "lider", label: "Líder" },
        { chave: "data", label: "Data" },
        { chave: "responsavel", label: "Responsável" },
        { chave: "acao", label: "Ação" },
        { chave: "status", label: "Status" },
      ],
      linhas: itens.map((c) => ({
        nome: c.nome ?? "-",
        bairro: c.bairro,
        lider: c.liderComunidade ?? "-",
        data: formatarData(c.data),
        responsavel: c.responsavelAssessor?.nome ?? "-",
        acao: c.descricaoAcao ?? "-",
        status: STATUS_LABEL[c.status],
      })),
    };
  }

  return (
    <div className="text-emerald-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Relatório de Comunidades</h1>
        <ExportButtons gerarDados={gerarDados} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <label className="text-sm">
          Buscar (bairro/nome)
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
            onChange={(e) => setFiltroStatus(e.target.value as StatusComunidade | "")}
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
                <th className="py-2">Nome</th>
                <th>Bairro</th>
                <th>Líder</th>
                <th>Data</th>
                <th>Responsável</th>
                <th>Ação</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((c) => (
                <tr key={c.id} className="border-b border-neutral-900">
                  <td className="py-2">{c.nome ?? "-"}</td>
                  <td>{c.bairro}</td>
                  <td>{c.liderComunidade ?? "-"}</td>
                  <td>{formatarData(c.data)}</td>
                  <td>{c.responsavelAssessor?.nome ?? "-"}</td>
                  <td>{c.descricaoAcao ?? "-"}</td>
                  <td>{STATUS_LABEL[c.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}