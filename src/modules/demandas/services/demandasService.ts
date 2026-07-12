import type {
  Demanda,
  DadosDemandaInput,
  FiltrosDemandaInput,
  ResultadoPaginado,
} from "@/types/electron";

export async function listarDemandas(
  filtros?: FiltrosDemandaInput
): Promise<ResultadoPaginado<Demanda>> {
  const res = await window.electronAPI.listarDemandas(filtros);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao listar demandas");
  }
  const { itens, total, pagina, totalPaginas } = res;
  return { itens, total, pagina, totalPaginas };
}

export async function criarDemanda(dados: DadosDemandaInput, usuarioId: number) {
  const res = await window.electronAPI.criarDemanda(dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao criar demanda");
  }
  return res.demanda;
}

export async function atualizarDemanda(
  id: number,
  dados: DadosDemandaInput,
  usuarioId: number
) {
  const res = await window.electronAPI.atualizarDemanda(id, dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao atualizar demanda");
  }
  return res.demanda;
}

export async function inativarDemanda(id: number, usuarioId: number) {
  const res = await window.electronAPI.inativarDemanda(id, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao inativar demanda");
  }
}