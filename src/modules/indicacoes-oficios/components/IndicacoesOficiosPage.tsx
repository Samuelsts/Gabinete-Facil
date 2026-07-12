'use client';

import { useEffect, useState } from 'react';
import type {
  IndicacaoOficio,
  TipoIndicacaoOficio,
  StatusIndicacaoOficio,
  Assessor,
} from '@/types/electron';
import {
  listarIndicacoesOficios,
  inativarIndicacaoOficio,
} from '../services/indicacoesOficiosService';
import { baixarAnexo } from '../services/anexosIndicacaoOficioService';
import { listarAssessores } from '@/modules/assessores/services/assessoresService';
import { useSessao } from '@/contexts/SessaoContext';
import { IndicacaoOficioFormModal } from './IndicacaoOficioFormModal';
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

const STATUS_LABEL: Record<StatusIndicacaoOficio, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
};

const TIPO_LABEL: Record<TipoIndicacaoOficio, string> = {
  INDICACAO: 'Indicação',
  OFICIO: 'Ofício',
};

export function IndicacoesOficiosPage() {
  const { usuario } = useSessao();
  const [itens, setItens] = useState<IndicacaoOficio[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);

  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoIndicacaoOficio | ''>('');
  const [filtroStatus, setFiltroStatus] = useState<StatusIndicacaoOficio | ''>(
    '',
  );
  const [filtroAssessorId, setFiltroAssessorId] = useState(0);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [assessores, setAssessores] = useState<Assessor[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState<IndicacaoOficio | null>(
    null,
  );

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

  const filtrosAtuais = `${busca}|${filtroTipo}|${filtroStatus}|${filtroAssessorId}|${dataInicio}|${dataFim}`;
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
        const resultado = await listarIndicacoesOficios({
          busca: busca || undefined,
          tipo: filtroTipo || undefined,
          status: filtroStatus || undefined,
          responsavelAssessorId: filtroAssessorId || undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
          pagina,
        });
        if (!ignore) {
          setItens(resultado.itens);
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
    filtroTipo,
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
    setFiltroTipo('');
    setFiltroStatus('');
    setFiltroAssessorId(0);
    setDataInicio('');
    setDataFim('');
  }

  async function handleInativar(id: number) {
    if (!usuario) return;
    if (!confirm('Deseja excluir este registro?')) return;

    try {
      await inativarIndicacaoOficio(id, usuario.id);
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
        <h1 className="text-xl text-emerald-900 font-semibold">Indicações e Ofícios</h1>
        {podeCriar && (<button
          onClick={() => setModalAberto(true)}
          className="px-4 py-1.5 rounded cursor-pointer bg-emerald-600 hover:bg-blue-500 text-sm"
        >
          Novo Registro
        </button>)}

      </div>

      <div className="flex flex-wrap text-emerald-900 gap-3 mb-4 items-end">
        <label className="text-sm text-emerald-950">
          Buscar (destinatário/protocolo)
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="block text-emerald-900 border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
          />
        </label>

        <label className="text-sm">
          Tipo
          <select
            value={filtroTipo}
            onChange={(e) =>
              setFiltroTipo(e.target.value as TipoIndicacaoOficio | '')
            }
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
            onChange={(e) =>
              setFiltroStatus(e.target.value as StatusIndicacaoOficio | '')
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
                <th className="py-2">Tipo</th>
                <th>Protocolo</th>
                <th>Destinatário</th>
                <th>Data</th>
                <th>Responsável</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Anexos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id} className="border-b border-neutral-900">
                  <td className="py-2">{TIPO_LABEL[item.tipo]}</td>
                  <td>{item.numeroProtocolo ?? '-'}</td>
                  <td>{item.destinatario ?? '-'}</td>
                  <td>{formatarData(item.dataRegistro)}</td>
                  <td>{item.responsavelAssessor?.nome ?? '-'}</td>
                  <td>{previewDescricao(item.descricao)}</td>
                  <td>{STATUS_LABEL[item.status]}</td>
                  <td>
                    {item.anexos && item.anexos.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {item.anexos.map((anexo) => (
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
                    {podeEditar && ( <button
                      onClick={() => setItemEditando(item)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Editar
                    </button>)}
                    {podeExcluir && (<button
                      onClick={() => handleInativar(item.id)}
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

      <IndicacaoOficioFormModal
        key={itemEditando ? itemEditando.id : 'novo'}
        aberto={modalAberto || !!itemEditando}
        item={itemEditando}
        onFechar={() => {
          setModalAberto(false);
          setItemEditando(null);
        }}
        onSalvo={() => {
          setModalAberto(false);
          setItemEditando(null);
          recarregar();
        }}
      />
    </div>
  );
}
