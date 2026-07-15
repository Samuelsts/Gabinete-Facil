'use client';

import { useEffect, useState } from 'react';
import type {
  Cidadao,
  HistoricoCidadao,
  StatusAtendimento,
  StatusDemanda,
} from '@/types/electron';
import { obterHistoricoCidadao } from '../services/cidadaosService';

interface HistoricoCidadaoModalProps {
  cidadao: Cidadao | null;
  onFechar: () => void;
}

function formatarData(valor: Date | string | null): string {
  if (!valor) return '-';
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

const STATUS_ATENDIMENTO_LABEL: Record<StatusAtendimento, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
};

const STATUS_DEMANDA_LABEL: Record<StatusDemanda, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
};

export function HistoricoCidadaoModal({
  cidadao,
  onFechar,
}: HistoricoCidadaoModalProps) {
  const [historico, setHistorico] = useState<HistoricoCidadao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!cidadao) return;

    let ignore = false;

    async function run() {
      setCarregando(true);
      setErro(null);
      try {
        const dados = await obterHistoricoCidadao(cidadao!.id);
        if (!ignore) setHistorico(dados);
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
  }, [cidadao]);

  if (!cidadao) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onFechar}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-2xl p-5 text-neutral-100 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Histórico — {cidadao.nome}</h2>
          <button
            onClick={onFechar}
            className="text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            Fechar
          </button>
        </div>

        <p className="text-sm text-neutral-500 mb-4">
          {formatarData(cidadao.dataNascimento)} · {cidadao.celular ?? '-'}
        </p>

        {erro && <p className="text-red-400 text-sm mb-3">{erro}</p>}

        {carregando ? (
          <p>Carregando...</p>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">
                Últimos Atendimentos
              </h3>
              {!historico || historico.atendimentos.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  Nenhum atendimento registrado.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-neutral-800">
                      <th className="py-1">Data</th>
                      <th>Resp.</th>
                      <th>Bairro</th>
                      <th>Descrição</th>
                      <th>Status</th>
                      <th>Conclusão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.atendimentos.map((a) => (
                      <tr key={a.id} className="border-b border-neutral-900 *:pr-2">
                        <td className="py-1">
                          {formatarData(a.dataAtendimento)}
                        </td>
                        <td>{a.responsavelAssessor?.nome ?? '-'}</td>
                        <td>{a.bairro ?? '-'}</td>
                        <td>{a.descricao ?? '-'}</td>
                        <td>{STATUS_ATENDIMENTO_LABEL[a.status]}</td>
                        <td>{formatarData(a.dataConclusao)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-2">
                Últimas Demandas
              </h3>
              {!historico || historico.demandas.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  Nenhuma demanda registrada.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-neutral-800">
                      <th className="py-1">Data</th>
                      <th>Resp.</th>
                      <th>Bairro</th>
                      <th>Descrição</th>
                      <th>Status</th>
                      <th>Conclusão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.demandas.map((d) => (
                      <tr key={d.id} className="border-b border-neutral-900">
                        <td className="py-1">{formatarData(d.dataAbertura)}</td>
                        <td>{d.responsavelAssessor?.nome ?? '-'}</td>
                        <td>{d.bairro ?? '-'}</td>
                        <td>{d.descricao ?? '-'}</td>
                        <td>{STATUS_DEMANDA_LABEL[d.status]}</td>
                        <td>{formatarData(d.dataConclusao)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
