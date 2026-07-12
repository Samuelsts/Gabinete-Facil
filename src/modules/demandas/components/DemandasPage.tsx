'use client';

import { useEffect, useState } from 'react';
import type {
  Demanda,
  StatusDemanda,
  PrioridadeDemanda,
  Assessor,
} from '@/types/electron';
import { listarDemandas, inativarDemanda } from '../services/demandasService';
import { baixarAnexo } from '../services/anexosDemandaService';
import { listarAssessores } from '@/modules/assessores/services/assessoresService';
import { useSessao } from '@/contexts/SessaoContext';
import { DemandaFormModal } from './DemandaFormModal';
import { Pagination } from '@/components/Pagination/Pagination';
import { usePermissao } from '@/hooks/usePermissao';

function formatarData(valor: Date | string | null): string {
  if (!valor) return '-';
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function previewDescricao(texto: string | null): string {
  if (!texto) return '-';
  const palavras = texto.trim().split(/\s+/);
  if (palavras.length <= 6) return texto;
  return palavras.slice(0, 6).join(' ') + '...';
}

const STATUS_LABEL: Record<StatusDemanda, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
};

const PRIORIDADE_LABEL: Record<PrioridadeDemanda, string> = {
  ALTA: 'Alta',
  NORMAL: 'Normal',
  BAIXA: 'Baixa',
};
const PRIORIDADE_COR: Record<PrioridadeDemanda, string> = {
  ALTA: 'text-red-400',
  NORMAL: 'text-emerald-900',
  BAIXA: 'text-neutral-500',
};

export function DemandasPage() {
  const { usuario } = useSessao();
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusDemanda | ''>('');
  const [filtroPrioridade, setFiltroPrioridade] = useState<
    PrioridadeDemanda | ''
  >('');
  const [filtroAssessorId, setFiltroAssessorId] = useState(0);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [assessores, setAssessores] = useState<Assessor[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [demandaEditando, setDemandaEditando] = useState<Demanda | null>(null);

  const { podeCriar, podeEditar, podeExcluir } = usePermissao();

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

  // Ajuste de estado durante a renderização — mesmo padrão de
  // AtendimentosPage, evita o warning react-hooks/set-state-in-effect
  // ao resetar a página sempre que um filtro muda.
  const filtrosAtuais = `${busca}|${filtroStatus}|${filtroPrioridade}|${filtroAssessorId}|${dataInicio}|${dataFim}`;
  const [filtrosAnteriores, setFiltrosAnteriores] = useState(filtrosAtuais);

  if (filtrosAtuais !== filtrosAnteriores) {
    setFiltrosAnteriores(filtrosAtuais);
    setPagina(1);
  }

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
          pagina,
        });
        if (!ignore) {
          setDemandas(resultado.itens);
          setTotal(resultado.total);
          setTotalPaginas(resultado.totalPaginas);
        }
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
  }, [
    busca,
    filtroStatus,
    filtroPrioridade,
    filtroAssessorId,
    dataInicio,
    dataFim,
    pagina,
    versao,
  ]);

  function recarregar() {
    setVersao((v) => v + 1);
  }

  function limparFiltros() {
    setBusca('');
    setFiltroStatus('');
    setFiltroPrioridade('');
    setFiltroAssessorId(0);
    setDataInicio('');
    setDataFim('');
  }

  async function handleInativar(id: number) {
    if (!usuario) return;
    if (!confirm('Deseja excluir esta demanda?')) return;

    try {
      await inativarDemanda(id, usuario.id);
      recarregar();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleBaixarAnexo(anexoId: number) {
    try {
      await baixarAnexo(anexoId);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl text-emerald-900 font-semibold">Demandas</h1>
        {podeCriar && (
          <button
            onClick={() => setModalAberto(true)}
            className="px-4 py-1.5 rounded cursor-pointer bg-emerald-600 hover:bg-blue-500 text-sm"
          >
            Nova Demanda
          </button>
        )}
      </div>

      <div className="flex flex-wrap text-emerald-900 gap-3 mb-4 items-end">
        <label className="text-sm">
          Buscar cidadão
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome do cidadão..."
            className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          />
        </label>

        <label className="text-sm">
          Status
          <select
            value={filtroStatus}
            onChange={(e) =>
              setFiltroStatus(e.target.value as StatusDemanda | '')
            }
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
            onChange={(e) =>
              setFiltroPrioridade(e.target.value as PrioridadeDemanda | '')
            }
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
          <p className="text-xs text-neutral-500 mb-2">
            {total} registro(s) encontrado(s)
          </p>

          <table className="w-full text-emerald-900 text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-800">
                <th className="py-2">Cidadão</th>
                <th>Data</th>
                <th>Responsável</th>
                <th>Bairro</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Anexos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {demandas.map((d) => (
                <tr key={d.id} className="border-b border-neutral-900">
                  <td className="py-2">{d.cidadao?.nome ?? '-'}</td>
                  <td>{formatarData(d.dataAbertura)}</td>
                  <td>{d.responsavelAssessor?.nome ?? '-'}</td>
                  <td>{d.bairro ?? '-'}</td>
                  <td>{previewDescricao(d.descricao)}</td>
                  <td>{STATUS_LABEL[d.status]}</td>
                  <td className={PRIORIDADE_COR[d.prioridade]}>
                    {PRIORIDADE_LABEL[d.prioridade]}
                  </td>
                  <td>
                    {d.anexos && d.anexos.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {d.anexos.map((anexo) => (
                          <button
                            key={anexo.id}
                            onClick={() => handleBaixarAnexo(anexo.id)}
                            className="text-left text-blue-400 hover:text-blue-300 truncate max-w-[140px]"
                            title={anexo.nomeArquivo}
                          >
                            ⬇ {anexo.nomeArquivo}
                          </button>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {podeEditar && (
                      <button
                        onClick={() => setDemandaEditando(d)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        Editar
                      </button>
                    )}
                    {podeExcluir && (
                      <button
                        onClick={() => handleInativar(d.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            pagina={pagina}
            totalPaginas={totalPaginas}
            onMudarPagina={setPagina}
          />
        </>
      )}

      <DemandaFormModal
        key={demandaEditando ? demandaEditando.id : 'novo'}
        aberto={modalAberto || !!demandaEditando}
        demanda={demandaEditando}
        onFechar={() => {
          setModalAberto(false);
          setDemandaEditando(null);
        }}
        onSalvo={() => {
          setModalAberto(false);
          setDemandaEditando(null);
          recarregar();
        }}
      />
    </div>
  );
}
