'use client';

import { useEffect, useState } from 'react';
import type { Assessor, DadosRelatorio } from '@/types/electron';
import { listarAssessoresPaginado } from '@/modules/assessores/services/assessoresService';
import { ExportButtons } from '@/components/ExportButtons/ExportButtons';

function formatarData(valor: Date | string | null): string {
  if (!valor) return '-';
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

const TAMANHO_RELATORIO = 10000;

export function RelatorioAssessores() {
  const [itens, setItens] = useState<Assessor[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await listarAssessoresPaginado({
          busca: busca || undefined,
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
  }, [busca]);

  function gerarDados(): DadosRelatorio {
    return {
      titulo: 'Relatório de Assessores',
      colunas: [
        { chave: 'nome', label: 'Nome' },
        { chave: 'celular', label: 'Celular' },
        { chave: 'bairro', label: 'Bairro' },
        { chave: 'endereco', label: 'Endereço' },
        { chave: 'nascimento', label: 'Data de Nascimento' },
      ],
      linhas: itens.map((a) => ({
        nome: a.nome,
        celular: a.celular ?? '-',
        bairro: a.bairro ?? '-',
        endereco: a.endereco ?? '-',
        nascimento: formatarData(a.dataNascimento),
      })),
    };
  }

  return (
    <div className="text-emerald-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Relatório de Assessores</h1>
        <ExportButtons gerarDados={gerarDados} />
      </div>

      <input
        placeholder="Pesquisar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="border border-neutral-700 rounded px-3 py-1.5 mb-4 bg-transparent"
      />

      {erro && <p className="text-red-400 mb-2">{erro}</p>}

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <>
          <p className="text-xs text-neutral-500 mb-2">
            {itens.length} registro(s) encontrado(s)
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-800">
                <th className="py-2">Nome</th>
                <th>Celular</th>
                <th>Bairro</th>
                <th>Endereço</th>
                <th>Nascimento</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((a) => (
                <tr key={a.id} className="border-b border-neutral-900">
                  <td className="py-2">{a.nome}</td>
                  <td>{a.celular ?? '-'}</td>
                  <td>{a.bairro ?? '-'}</td>
                  <td>{a.endereco ?? '-'}</td>
                  <td>{formatarData(a.dataNascimento)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
