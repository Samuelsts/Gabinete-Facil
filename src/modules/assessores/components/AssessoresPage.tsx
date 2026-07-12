'use client';

import { useEffect, useState } from 'react';
import type { Assessor } from '@/types/electron';
import {
  listarAssessoresPaginado,
  inativarAssessor,
} from '../services/assessoresService';
import { useSessao } from '@/contexts/SessaoContext';
import { AssessorFormModal } from './AssessorFormModal';
import { Pagination } from '@/components/Pagination/Pagination';

export function AssessoresPage() {
  const { usuario } = useSessao();
  const [assessores, setAssessores] = useState<Assessor[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);

  const [busca, setBusca] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [assessorEditando, setAssessorEditando] = useState<Assessor | null>(
    null,
  );

  const [buscaAnterior, setBuscaAnterior] = useState(busca);

  if (busca !== buscaAnterior) {
    setBuscaAnterior(busca);
    setPagina(1);
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await listarAssessoresPaginado({
          busca: busca || undefined,
          pagina,
        });
        if (!ignore) {
          setAssessores(resultado.itens);
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
  }, [busca, pagina, versao]);

  function recarregar() {
    setVersao((v) => v + 1);
  }

  async function handleInativar(id: number) {
    if (!usuario) return;
    if (!confirm('Deseja inativar este assessor?')) return;

    try {
      await inativarAssessor(id, usuario.id);
      recarregar();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl text-emerald-900 font-semibold">Assessores</h1>
        <button
          onClick={() => setModalAberto(true)}
          className="px-4 cursor-pointer py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm"
        >
          Novo Assessor
        </button>
      </div>

      <input
        placeholder="Pesquisar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="border text-emerald-900 border-neutral-700 rounded px-3 py-1.5 mb-4 bg-transparent"
      />

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
                <th>Celular</th>
                <th>Bairro</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assessores.map((a) => (
                <tr key={a.id} className="border-b border-neutral-900">
                  <td className="py-2">{a.nome}</td>
                  <td>{a.celular ?? '-'}</td>
                  <td>{a.bairro ?? '-'}</td>
                  <td>
                    <button
                      onClick={() => setAssessorEditando(a)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleInativar(a.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Inativar
                    </button>
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

      <AssessorFormModal
        key={assessorEditando ? assessorEditando.id : 'novo'}
        aberto={modalAberto || !!assessorEditando}
        assessor={assessorEditando}
        onFechar={() => {
          setModalAberto(false);
          setAssessorEditando(null);
        }}
        onSalvo={() => {
          setModalAberto(false);
          setAssessorEditando(null);
          recarregar();
        }}
      />
    </div>
  );
}
