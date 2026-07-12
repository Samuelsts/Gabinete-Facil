'use client';

import { useState } from 'react';
import type { DadosRelatorio } from '@/types/electron';

interface ExportButtonsProps {
  gerarDados: () => DadosRelatorio;
}

// Componente burro por design: recebe uma função que monta o
// DadosRelatorio na hora do clique (não os dados prontos), porque
// cada tela de relatório decide o que exportar no momento exato do
// clique — evita recalcular/reformatar dados toda vez que o estado
// da tela muda, só quando o usuário realmente pede a exportação.
export function ExportButtons({ gerarDados }: ExportButtonsProps) {
  const [exportando, setExportando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function exportar(
    tipo: 'csv' | 'excel' | 'pdf',
    fn: (
      dados: DadosRelatorio,
    ) => Promise<{ sucesso: boolean; cancelado?: boolean; erro?: string }>,
  ) {
    setExportando(tipo);
    setErro(null);
    try {
      const dados = gerarDados();
      const res = await fn(dados);
      if (!res.sucesso) {
        throw new Error(res.erro ?? 'Erro ao exportar');
      }
      // res.cancelado === true significa que o usuário fechou o
      // diálogo "Salvar como" sem escolher local — não é erro, só
      // não fazemos nada nesse caso.
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setExportando(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => exportar('csv', window.electronAPI.exportarRelatorioCsv)}
        disabled={!!exportando}
        className="px-3 py-1.5 rounded border border-neutral-700 text-sm hover:bg-emerald-800 hover:text-white cursor-pointer disabled:opacity-50"
      >
        {exportando === 'csv' ? 'Exportando...' : 'Exportar CSV'}
      </button>
      <button
        onClick={() =>
          exportar('excel', window.electronAPI.exportarRelatorioExcel)
        }
        disabled={!!exportando}
        className="px-3 py-1.5 rounded border border-neutral-700 text-sm hover:bg-emerald-800 hover:text-white cursor-pointer disabled:opacity-50"
      >
        {exportando === 'excel' ? 'Exportando...' : 'Exportar Excel'}
      </button>
      <button
        onClick={() => exportar('pdf', window.electronAPI.exportarRelatorioPdf)}
        disabled={!!exportando}
        className="px-3 py-1.5 rounded border border-neutral-700 text-sm hover:bg-emerald-800 hover:text-white cursor-pointer disabled:opacity-50"
      >
        {exportando === 'pdf' ? 'Exportando...' : 'Exportar PDF'}
      </button>
      {erro && <span className="text-red-400 text-sm ml-2">{erro}</span>}
    </div>
  );
}
