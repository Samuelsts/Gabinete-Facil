'use client';

import { useEffect, useState } from 'react';
import type { AniversarianteItem, DadosRelatorio } from '@/types/electron';
import {
  listarAniversariantesCidadaos,
  listarAniversariantesAssessores,
} from '../services/relatoriosService';
import { ExportButtons } from '@/components/ExportButtons/ExportButtons';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function formatarDataDia(valor: Date | string): string {
  const data = valor instanceof Date ? valor : new Date(valor);
  return data.toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
  });
}

interface RelatorioAniversariantesProps {
  tipo: 'cidadaos' | 'assessores';
}

export function RelatorioAniversariantes({
  tipo,
}: RelatorioAniversariantesProps) {
  const [mes, setMes] = useState(new Date().getMonth());
  const [itens, setItens] = useState<AniversarianteItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const titulo =
    tipo === 'cidadaos'
      ? 'Aniversariantes de Cidadãos'
      : 'Aniversariantes de Assessores';

  useEffect(() => {
    let ignore = false;

    async function run() {
      setCarregando(true);
      setErro(null);
      try {
        const dados =
          tipo === 'cidadaos'
            ? await listarAniversariantesCidadaos(mes)
            : await listarAniversariantesAssessores(mes);
        if (!ignore) setItens(dados);
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
  }, [tipo, mes]);

  // Monta o DadosRelatorio só na hora de exportar — ExportButtons
  // chama essa função no clique, não a cada render.
  function gerarDados(): DadosRelatorio {
    return {
      titulo,
      colunas: [
        { chave: 'nome', label: 'Nome' },
        { chave: 'celular', label: 'Celular' },
        { chave: 'bairro', label: 'Bairro' },
        { chave: 'aniversario', label: 'Aniversário' },
      ],
      linhas: itens.map((item) => ({
        nome: item.nome,
        celular: item.celular ?? '-',
        bairro: item.bairro ?? '-',
        aniversario: formatarDataDia(item.dataNascimento),
      })),
    };
  }

  return (
    <div className="text-emerald-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{titulo}</h1>
        <ExportButtons gerarDados={gerarDados} />
      </div>

      <label className="text-sm block mb-4">
        Mês
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="block border border-neutral-700 rounded px-2 py-1 bg-transparent mt-1"
        >
          {MESES.map((nomeMes, index) => (
            <option key={index} value={index}>
              {nomeMes}
            </option>
          ))}
        </select>
      </label>

      {erro && <p className="text-red-400 mb-2">{erro}</p>}

      {carregando ? (
        <p>Carregando...</p>
      ) : itens.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          Nenhum aniversariante em {MESES[mes]}.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-800">
              <th className="py-2">Nome</th>
              <th>Celular</th>
              <th>Bairro</th>
              <th>Aniversário</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id} className="border-b border-neutral-900">
                <td className="py-2">{item.nome}</td>
                <td>{item.celular ?? '-'}</td>
                <td>{item.bairro ?? '-'}</td>
                <td>{formatarDataDia(item.dataNascimento)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
