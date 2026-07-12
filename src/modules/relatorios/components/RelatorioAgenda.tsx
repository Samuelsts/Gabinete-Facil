"use client";

import { useEffect, useState } from "react";
import type { AgendaItem, StatusAgenda, DadosRelatorio } from "@/types/electron";
import { listarAgenda } from "@/modules/agenda/services/agendaService";
import { ExportButtons } from "@/components/ExportButtons/ExportButtons";

function formatarData(valor: Date | string | null): string {
  if (!valor) return "-";
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const STATUS_LABEL: Record<StatusAgenda, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

const TAMANHO_RELATORIO = 10000;

export function RelatorioAgenda() {
  const [itens, setItens] = useState<AgendaItem[]>([]);

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusAgenda | "">("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await listarAgenda({
          busca: busca || undefined,
          status: filtroStatus || undefined,
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
  }, [busca, filtroStatus, dataInicio, dataFim]);

  function limparFiltros() {
    setBusca("");
    setFiltroStatus("");
    setDataInicio("");
    setDataFim("");
  }

  function gerarDados(): DadosRelatorio {
    return {
      titulo: "Relatório de Agenda",
      colunas: [
        { chave: "data", label: "Data" },
        { chave: "acao", label: "Ação/Compromisso" },
        { chave: "nome", label: "Nome" },
        { chave: "bairro", label: "Bairro" },
        { chave: "descricao", label: "Descrição" },
        { chave: "status", label: "Status" },
      ],
      linhas: itens.map((item) => ({
        data: formatarData(item.data),
        acao: item.acaoCompromisso,
        nome: item.nome ?? "-",
        bairro: item.bairro ?? "-",
        descricao: item.descricao ?? "-",
        status: STATUS_LABEL[item.status],
      })),
    };
  }

  return (
    <div className="text-emerald-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Relatório de Agenda</h1>
        <ExportButtons gerarDados={gerarDados} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <label className="text-sm">
          Buscar (ação/nome/bairro)
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
            onChange={(e) => setFiltroStatus(e.target.value as StatusAgenda | "")}
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          >
            <option value="">Todos</option>
            <option value="ABERTO">Aberto</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="CONCLUIDO">Concluído</option>
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
                <th className="py-2">Data</th>
                <th>Ação/Compromisso</th>
                <th>Nome</th>
                <th>Bairro</th>
                <th>Descrição</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id} className="border-b border-neutral-900">
                  <td className="py-2">{formatarData(item.data)}</td>
                  <td>{item.acaoCompromisso}</td>
                  <td>{item.nome ?? "-"}</td>
                  <td>{item.bairro ?? "-"}</td>
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