'use client';

import { useEffect, useState } from 'react';
import type { Comunidade, StatusComunidade, Assessor } from '@/types/electron';
import {
  listarComunidades,
  inativarComunidade,
} from '../services/comunidadesService';
import { listarAssessores } from '@/modules/assessores/services/assessoresService';
import { useSessao } from '@/contexts/SessaoContext';
import { ComunidadeFormModal } from './ComunidadeFormModal';
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

const STATUS_LABEL: Record<StatusComunidade, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
};

export function ComunidadesPage() {
  const { usuario } = useSessao();
  const [comunidades, setComunidades] = useState<Comunidade[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusComunidade | ''>('');
  const [filtroAssessorId, setFiltroAssessorId] = useState(0);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [assessores, setAssessores] = useState<Assessor[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [comunidadeEditando, setComunidadeEditando] =
    useState<Comunidade | null>(null);

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

  const filtrosAtuais = `${busca}|${filtroStatus}|${filtroAssessorId}|${dataInicio}|${dataFim}`;
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
        const resultado = await listarComunidades({
          busca: busca || undefined,
          status: filtroStatus || undefined,
          responsavelAssessorId: filtroAssessorId || undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
          pagina,
        });
        if (!ignore) {
          setComunidades(resultado.itens);
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
    setFiltroAssessorId(0);
    setDataInicio('');
    setDataFim('');
  }

  async function handleInativar(id: number) {
    if (!usuario) return;
    if (!confirm('Deseja excluir este registro?')) return;

    try {
      await inativarComunidade(id, usuario.id);
      recarregar();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center  justify-between mb-4">
        <h1 className="text-xl text-emerald-900 font-semibold">Comunidades</h1>
        {podeCriar && ( <button
          onClick={() => setModalAberto(true)}
          className="px-4 py-1.5 rounded cursor-pointer bg-emerald-600 hover:bg-blue-500 text-sm"
        >
          Novo Registro
        </button>)}
      </div>

      <div className="flex flex-wrap text-emerald-900 gap-3 mb-4 items-end">
        <label className="text-sm text-emerald-900">
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
            onChange={(e) =>
              setFiltroStatus(e.target.value as StatusComunidade | '')
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
          className="text-sm cursor-pointer text-neutral-400 hover:text-emerald-900 underline"
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
                <th className="py-2">Nome</th>
                <th>Bairro</th>
                <th>Líder</th>
                <th>Data</th>
                <th>Responsável</th>
                <th>Ação</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {comunidades.map((c) => (
                <tr key={c.id} className="border-b border-neutral-900">
                  <td className="py-2">{c.nome ?? '-'}</td>
                  <td>{c.bairro}</td>
                  <td>{c.liderComunidade ?? '-'}</td>
                  <td>{formatarData(c.data)}</td>
                  <td>{c.responsavelAssessor?.nome ?? '-'}</td>
                  <td>{previewDescricao(c.descricaoAcao)}</td>
                  <td>{STATUS_LABEL[c.status]}</td>
                  <td>
                    {podeEditar && (<button
                      onClick={() => setComunidadeEditando(c)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Editar
                    </button>)}
                    {podeExcluir && (<button
                      onClick={() => handleInativar(c.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </button>)}

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

      <ComunidadeFormModal
        key={comunidadeEditando ? comunidadeEditando.id : 'novo'}
        aberto={modalAberto || !!comunidadeEditando}
        comunidade={comunidadeEditando}
        onFechar={() => {
          setModalAberto(false);
          setComunidadeEditando(null);
        }}
        onSalvo={() => {
          setModalAberto(false);
          setComunidadeEditando(null);
          recarregar();
        }}
      />
    </div>
  );
}
