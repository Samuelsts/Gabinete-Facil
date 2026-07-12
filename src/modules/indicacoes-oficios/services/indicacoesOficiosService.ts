import type {
  IndicacaoOficio,
  DadosIndicacaoOficioInput,
  FiltrosIndicacaoOficioInput,
  ResultadoPaginado,
} from "@/types/electron";

export async function listarIndicacoesOficios(
  filtros?: FiltrosIndicacaoOficioInput
): Promise<ResultadoPaginado<IndicacaoOficio>> {
  const res = await window.electronAPI.listarIndicacoesOficios(filtros);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao listar indicações/ofícios");
  }
  const { itens, total, pagina, totalPaginas } = res;
  return { itens, total, pagina, totalPaginas };
}

export async function criarIndicacaoOficio(
  dados: DadosIndicacaoOficioInput,
  usuarioId: number
) {
  const res = await window.electronAPI.criarIndicacaoOficio(dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao criar indicação/ofício");
  }
  return res.indicacaoOficio;
}

export async function atualizarIndicacaoOficio(
  id: number,
  dados: DadosIndicacaoOficioInput,
  usuarioId: number
) {
  const res = await window.electronAPI.atualizarIndicacaoOficio(id, dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao atualizar indicação/ofício");
  }
  return res.indicacaoOficio;
}

export async function inativarIndicacaoOficio(id: number, usuarioId: number) {
  const res = await window.electronAPI.inativarIndicacaoOficio(id, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao inativar indicação/ofício");
  }
}