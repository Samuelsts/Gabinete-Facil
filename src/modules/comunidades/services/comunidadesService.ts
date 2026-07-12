import type {
  Comunidade,
  DadosComunidadeInput,
  FiltrosComunidadeInput,
  ResultadoPaginado,
} from "@/types/electron";

export async function listarComunidades(
  filtros?: FiltrosComunidadeInput
): Promise<ResultadoPaginado<Comunidade>> {
  const res = await window.electronAPI.listarComunidades(filtros);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao listar comunidades");
  }
  const { itens, total, pagina, totalPaginas } = res;
return {
  itens: itens ?? [],
  total: total ?? 0,
  pagina: pagina ?? 1,
  totalPaginas: totalPaginas ?? 1,
};
}

export async function criarComunidade(dados: DadosComunidadeInput, usuarioId: number) {
  const res = await window.electronAPI.criarComunidade(dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao criar comunidade");
  }
  return res.comunidade;
}

export async function atualizarComunidade(
  id: number,
  dados: DadosComunidadeInput,
  usuarioId: number
) {
  const res = await window.electronAPI.atualizarComunidade(id, dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao atualizar comunidade");
  }
  return res.comunidade;
}

export async function inativarComunidade(id: number, usuarioId: number) {
  const res = await window.electronAPI.inativarComunidade(id, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao inativar comunidade");
  }
}