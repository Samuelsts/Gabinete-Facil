import type {
  Assessor,
  DadosAssessorInput,
  FiltrosAssessorInput,
  ResultadoPaginado,
} from '@/types/electron';

// Usada pela tela de listagem de Assessores — respeita paginação real.
export async function listarAssessoresPaginado(
  filtros?: FiltrosAssessorInput,
): Promise<ResultadoPaginado<Assessor>> {
  const res = await window.electronAPI.listarAssessores(filtros);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao listar assessores');
  }
  const { itens, total, pagina, totalPaginas } = res;
  return {
    itens: itens ?? [],
    total: total ?? 0,
    pagina: pagina ?? 1,
    totalPaginas: totalPaginas ?? 1,
  };
}

// Usada pelos <select> de responsável/assessor nos 4 módulos que
// dependem dela — precisa da lista inteira, não paginada. Mesmo
// raciocínio aplicado em listarCidadaos: tamanhoPagina alto cobre o
// uso real (dezenas/centenas de assessores num gabinete), sem
// justificar um combobox com busca assíncrona.
export async function listarAssessores(busca?: string): Promise<Assessor[]> {
  const res = await window.electronAPI.listarAssessores({
    busca,
    tamanhoPagina: 10000,
  });
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao listar assessores');
  }
  return res.itens ?? [];
}

export async function criarAssessor(
  dados: DadosAssessorInput,
  usuarioId: number,
) {
  const res = await window.electronAPI.criarAssessor(dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao criar assessor');
  }
  return res.assessor;
}

export async function atualizarAssessor(
  id: number,
  dados: Partial<DadosAssessorInput>,
  usuarioId: number,
) {
  const res = await window.electronAPI.atualizarAssessor(id, dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao atualizar assessor');
  }
  return res.assessor;
}

export async function inativarAssessor(id: number, usuarioId: number) {
  const res = await window.electronAPI.inativarAssessor(id, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao inativar assessor');
  }
}
