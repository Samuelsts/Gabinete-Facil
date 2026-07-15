'use client';

import { useEffect, useState } from 'react';
import type { Cidadao } from '@/types/electron';
import {
  listarCidadaosPaginado,
  inativarCidadao,
} from '../services/cidadaosService';
import { useSessao } from '@/contexts/SessaoContext';
import { CidadaoFormModal } from './CidadaoFormModal';
import { Pagination } from '@/components/Pagination/Pagination';
import { usePermissao } from '@/hooks/usePermissao';
import { HistoricoCidadaoModal } from './HistoricoCidadaoModal';

export function CidadaosPage() {
  const { usuario } = useSessao();
  const [cidadaos, setCidadaos] = useState<Cidadao[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pagina, setPagina] = useState(1);

  const [busca, setBusca] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [cidadaoEditando, setCidadaoEditando] = useState<Cidadao | null>(null);

  const [cidadaoHistorico, setCidadaoHistorico] = useState<Cidadao | null>(
    null,
  );

  const { podeCriar, podeEditar, podeExcluir } = usePermissao();

  // Ajuste de estado durante a renderização — mesmo padrão dos outros
  // módulos, evita o warning react-hooks/set-state-in-effect ao
  // resetar a página sempre que a busca muda.
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
        const resultado = await listarCidadaosPaginado({
          busca: busca || undefined,
          pagina,
        });
        if (!ignore) {
          setCidadaos(resultado.itens);
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
    if (!confirm('Deseja inativar este cidadão?')) return;

    try {
      await inativarCidadao(id, usuario.id);
      recarregar();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl text-emerald-950 font-semibold">Cidadãos</h1>
        {podeCriar && (
          <button
            onClick={() => setModalAberto(true)}
            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-blue-500 text-sm cursor-pointer"
          >
            Novo Cidadão
          </button>
        )}
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
          <p className="text-xs text-emerald-500 mb-2">
            {total} registro(s) encontrado(s)
          </p>

          <table className="w-full text-emerald-950 text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-800">
                <th className="py-2">Nome</th>
                <th>Celular</th>
                <th>Bairro</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cidadaos.map((c) => (
                <tr key={c.id} className="border-b border-emerald-900">
                  <td className="py-2">{c.nome}</td>
                  <td>{c.celular ?? '-'}</td>
                  <td>{c.bairro ?? '-'}</td>
                  <td>
                    <button
                      onClick={() => setCidadaoHistorico(c)}
                      className="text-emerald-400 cursor-pointer hover:text-blue-900 mr-3"
                    >
                      Ver histórico
                    </button>
                    {podeEditar && (
                      <button
                        onClick={() => setCidadaoEditando(c)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        Editar
                      </button>
                    )}
                    {podeExcluir && (
                      <button
                        onClick={() => handleInativar(c.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Inativar
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

      <CidadaoFormModal
        key={cidadaoEditando ? cidadaoEditando.id : 'novo'}
        aberto={modalAberto || !!cidadaoEditando}
        cidadao={cidadaoEditando}
        onFechar={() => {
          setModalAberto(false);
          setCidadaoEditando(null);
        }}
        onSalvo={() => {
          setModalAberto(false);
          setCidadaoEditando(null);
          recarregar();
        }}
      />
      <HistoricoCidadaoModal
        cidadao={cidadaoHistorico}
        onFechar={() => setCidadaoHistorico(null)}
      />
    </div>
  );
}
