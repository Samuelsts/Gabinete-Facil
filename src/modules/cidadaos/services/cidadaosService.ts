import type {
  Cidadao,
  DadosCidadaoInput,
  FiltrosCidadaoInput,
  ResultadoPaginado,
} from '@/types/electron';

import type { HistoricoCidadao } from '@/types/electron';

// Usada pela tela de listagem de Cidadãos — respeita paginação real.
export async function listarCidadaosPaginado(
  filtros?: FiltrosCidadaoInput,
): Promise<ResultadoPaginado<Cidadao>> {
  const res = await window.electronAPI.listarCidadaos(filtros);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao listar cidadãos');
  }
  const { itens, total, pagina, totalPaginas } = res;
  return {
    itens: itens ?? [],
    total: total ?? 0,
    pagina: pagina ?? 1,
    totalPaginas: totalPaginas ?? 1,
  };
}

// Usada pelos <select> de cidadão em Atendimentos/Demandas/Comunidades —
// esses formulários precisam da lista inteira (não paginada) para o
// usuário escolher qualquer cidadão cadastrado, não só os 20 primeiros.
// tamanhoPagina alto o suficiente para cobrir o uso real de um gabinete
// (milhares de cidadãos, não milhões — não justifica um combobox com
// busca assíncrona/autocomplete, que seria complexidade desnecessária
// aqui).
export async function listarCidadaos(busca?: string): Promise<Cidadao[]> {
  const res = await window.electronAPI.listarCidadaos({
    busca,
    tamanhoPagina: 10000,
  });
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao listar cidadãos');
  }
  return res.itens ?? [];
}

export async function criarCidadao(
  dados: DadosCidadaoInput,
  usuarioId: number,
) {
  const res = await window.electronAPI.criarCidadao(dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao criar cidadão');
  }
  return res.cidadao;
}

export async function atualizarCidadao(
  id: number,
  dados: Partial<DadosCidadaoInput>,
  usuarioId: number,
) {
  const res = await window.electronAPI.atualizarCidadao(id, dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao atualizar cidadão');
  }
  return res.cidadao;
}

export async function inativarCidadao(id: number, usuarioId: number) {
  const res = await window.electronAPI.inativarCidadao(id, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao inativar cidadão');
  }
}

export async function obterHistoricoCidadao(
  cidadaoId: number,
): Promise<HistoricoCidadao> {
  const res = await window.electronAPI.obterHistoricoCidadao(cidadaoId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao obter histórico do cidadão');
  }
  return {
    atendimentos: res.atendimentos ?? [],
    demandas: res.demandas ?? [],
  };
}
