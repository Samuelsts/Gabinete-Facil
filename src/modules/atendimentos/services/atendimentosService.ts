import type {
  Atendimento,
  DadosAtendimentoInput,
  FiltrosAtendimentoInput,
  ResultadoPaginado,
} from "@/types/electron";

export async function listarAtendimentos(
  filtros?: FiltrosAtendimentoInput
): Promise<ResultadoPaginado<Atendimento>> {
  const res = await window.electronAPI.listarAtendimentos(filtros);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao listar atendimentos");
  }
  // Desestruturar aqui em vez de retornar `res` inteiro: `res` também
  // carrega o campo `sucesso`, que não faz parte do contrato
  // ResultadoPaginado. Repassar só os 4 campos relevantes mantém o
  // retorno desta função fiel ao tipo que ela promete.
  const { itens, total, pagina, totalPaginas } = res;
  return { itens, total, pagina, totalPaginas };
}

export async function criarAtendimento(
  dados: DadosAtendimentoInput,
  usuarioId: number
) {
  const res = await window.electronAPI.criarAtendimento(dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao criar atendimento");
  }
  return res.atendimento;
}

export async function atualizarAtendimento(
  id: number,
  dados: DadosAtendimentoInput,
  usuarioId: number
) {
  const res = await window.electronAPI.atualizarAtendimento(id, dados, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao atualizar atendimento");
  }
  return res.atendimento;
}

export async function inativarAtendimento(id: number, usuarioId: number) {
  const res = await window.electronAPI.inativarAtendimento(id, usuarioId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao inativar atendimento");
  }
}