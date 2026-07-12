'use client';

import { useEffect, useState } from 'react';
import type {
  Atendimento,
  StatusAtendimento,
  Assessor,
} from '@/types/electron';
import {
  listarAtendimentos,
  inativarAtendimento,
} from '../services/atendimentosService';
import { baixarAnexo } from '../services/anexosService';
import { listarAssessores } from '@/modules/assessores/services/assessoresService';
import { useSessao } from '@/contexts/SessaoContext';
import { AtendimentoFormModal } from './AtendimentoFormModal';
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

const STATUS_LABEL: Record<StatusAtendimento, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
};

export function AtendimentosPage() {
  const { usuario } = useSessao();
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusAtendimento | ''>('');
  const [filtroAssessorId, setFiltroAssessorId] = useState(0);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [assessores, setAssessores] = useState<Assessor[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [atendimentoEditando, setAtendimentoEditando] =
    useState<Atendimento | null>(null);

  const { podeCriar, podeEditar, podeExcluir } = usePermissao();

  // Carrega a lista de assessores uma única vez, ao montar — é dado
  // de apoio para o filtro, não muda com a paginação/busca da tabela.
  useEffect(() => {
    let ignore = false;
    listarAssessores()
      .then((lista) => {
        if (!ignore) setAssessores(lista);
      })
      .catch(() => {
        // Falha ao carregar assessores não deve travar a tela toda —
        // o filtro por assessor simplesmente fica vazio nesse caso.
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Toda vez que qualquer filtro muda, a página deve voltar para 1 —
  // senão o usuário pode ficar "preso" na página 5 de um filtro que
  // agora só tem 2 páginas de resultado. Fazemos isso resetando
  // `pagina` num efeito próprio, disparado só pelos filtros (não
  // por `pagina` em si, senão criaria um loop).
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
        const resultado = await listarAtendimentos({
          busca: busca || undefined,
          status: filtroStatus || undefined,
          responsavelAssessorId: filtroAssessorId || undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
          pagina,
        });
        if (!ignore) {
          setAtendimentos(resultado.itens);
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
    if (!confirm('Deseja excluir este atendimento?')) return;

    try {
      await inativarAtendimento(id, usuario.id);
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
      <div className="flex items-center  justify-between mb-4">
        <h1 className="text-xl text-emerald-900 font-semibold">Atendimentos</h1>
        {podeCriar && (
          <button
            onClick={() => setModalAberto(true)}
            className="px-4 py-1.5 cursor-pointer rounded bg-emerald-600 hover:bg-blue-500 text-sm"
          >
            Novo Atendimento
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
              setFiltroStatus(e.target.value as StatusAtendimento | '')
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
          className="text-sm cursor-pointer text-neutral-600 hover:text-emerald-900 underline"
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
              <tr className="text-left border-b border-neutral-900">
                <th className="py-2">Cidadão</th>
                <th>Data</th>
                <th>Responsável</th>
                <th>Bairro</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Anexos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {atendimentos.map((a) => (
                <tr key={a.id} className="border-b border-neutral-900">
                  <td className="py-2">{a.cidadao?.nome ?? '-'}</td>
                  <td>{formatarData(a.dataAtendimento)}</td>
                  <td>{a.responsavelAssessor?.nome ?? '-'}</td>
                  <td>{a.bairro ?? '-'}</td>
                  <td>{previewDescricao(a.descricao)}</td>
                  <td>{STATUS_LABEL[a.status]}</td>
                  <td>
                    {a.anexos && a.anexos.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {a.anexos.map((anexo) => (
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
                        onClick={() => setAtendimentoEditando(a)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        Editar
                      </button>
                    )}
                    {podeExcluir && (
                      <button
                        onClick={() => handleInativar(a.id)}
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

      <AtendimentoFormModal
        key={atendimentoEditando ? atendimentoEditando.id : 'novo'}
        aberto={modalAberto || !!atendimentoEditando}
        atendimento={atendimentoEditando}
        onFechar={() => {
          setModalAberto(false);
          setAtendimentoEditando(null);
        }}
        onSalvo={() => {
          setModalAberto(false);
          setAtendimentoEditando(null);
          recarregar();
        }}
      />
    </div>
  );
}
