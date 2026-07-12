import type {
  AgendaItem,
  DadosAgendaInput,
  FiltrosAgendaInput,
  ResultadoPaginado,
} from "@/types/electron";

export async function listarAgenda(
  filtros?: FiltrosAgendaInput
): Promise<ResultadoPaginado<AgendaItem>> {
  const res = await window.electronAPI.listarAgenda(filtros);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao listar agenda");
  }
  const { itens, total, pagina, totalPaginas } = res;
  return {
    itens: itens ?? [],
    total: total ?? 0,
    pagina: pagina ?? 1,
    totalPaginas: totalPaginas ?? 1,
  };
}

export async function criarAgenda(dados: DadosAgendaInput, usuarioId: number) {
  const res = await window.electronAPI.criarAgenda(dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao criar item de agenda");
  }
  return res.item;
}

export async function atualizarAgenda(
  id: number,
  dados: DadosAgendaInput,
  usuarioId: number
) {
  const res = await window.electronAPI.atualizarAgenda(id, dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao atualizar item de agenda");
  }
  return res.item;
}

export async function inativarAgenda(id: number, usuarioId: number) {
  const res = await window.electronAPI.inativarAgenda(id, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao inativar item de agenda");
  }
}