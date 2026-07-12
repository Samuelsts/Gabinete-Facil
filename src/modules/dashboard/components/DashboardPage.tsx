"use client";

import { useEffect, useState } from "react";
import type { DashboardDados } from "@/types/electron";
import { obterDashboard } from "../services/dashboardService";

function formatarData(valor: Date | string): string {
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

// Card de número simples — reaproveitado 3 vezes (cidadãos, atendimentos,
// demandas abertas). Extrair evita repetir a mesma div 3 vezes com só
// o número e o label mudando.
function CardNumero({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="border border-emerald-800 rounded-lg p-4 flex-1">
      <p className="text-sm text-emerald-700">{label}</p>
      <p className="text-3xl font-semibold mt-1">{valor}</p>
    </div>
  );
}

export function DashboardPage() {
  const [dados, setDados] = useState<DashboardDados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await obterDashboard();
        if (!ignore) setDados(resultado);
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
  }, []);

  if (carregando) return <p>Carregando...</p>;
  if (erro) return <p className="text-red-400">{erro}</p>;
  if (!dados) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl text-emerald-950 font-semibold">Dashboard</h1>

      <div className="flex text-emerald-900 gap-4">
        <CardNumero label="Total de Cidadãos" valor={dados.totalCidadaos} />
        <CardNumero label="Total de Atendimentos" valor={dados.totalAtendimentos} />
        <CardNumero label="Demandas Abertas" valor={dados.demandasAbertas} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-emerald-950 mb-2">
            Agenda de Hoje
          </h2>
          {dados.agendaHoje.length === 0 ? (
            <p className="text-sm text-emerald-500">Nenhum compromisso hoje.</p>
          ) : (
            <ul className="text-sm flex flex-col gap-1">
              {dados.agendaHoje.map((item) => (
                <li key={item.id}>{item.acaoCompromisso}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-emerald-950 mb-2">
            Próximos Compromissos
          </h2>
          {dados.proximosCompromissos.length === 0 ? (
            <p className="text-sm text-emerald-500">Nenhum compromisso futuro.</p>
          ) : (
            <ul className="text-sm text-emerald-950 flex flex-col gap-1">
              {dados.proximosCompromissos.map((item) => (
                <li key={item.id}>
                  {formatarData(item.data)} — {item.acaoCompromisso}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-emerald-950 mb-2">
            Aniversariantes do Mês
          </h2>
          {dados.aniversariantes.length === 0 ? (
            <p className="text-sm text-emerald-500">Nenhum aniversariante este mês.</p>
          ) : (
            <ul className="text-sm text-emerald-950 flex flex-col gap-1">
              {dados.aniversariantes.map((c) => (
                <li key={c.id}>
                  {c.nome} — {formatarData(c.dataNascimento)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-emerald-950 mb-2">
            Atendimentos Recentes
          </h2>
          {dados.atendimentosRecentes.length === 0 ? (
            <p className="text-sm text-emerald-500">Nenhum atendimento registrado.</p>
          ) : (
            <ul className="text-sm text-emerald-950 flex flex-col gap-1">
              {dados.atendimentosRecentes.map((a) => (
                <li key={a.id}>
                  {a.cidadao?.nome ?? "-"} — {formatarData(a.dataAtendimento)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}