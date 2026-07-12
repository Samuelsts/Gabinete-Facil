import { prisma } from "../db";
import type { Prisma } from "@prisma/client";

interface DadosDemanda {
  cidadaoId: number;
  bairro?: string;
  dataAbertura: string;
  responsavelAssessorId: number;
  descricao?: string;
  status: "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO";
  prioridade: "BAIXA" | "NORMAL" | "ALTA";
  dataConclusao?: string;
}

interface FiltrosDemanda {
  busca?: string;
  status?: "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO";
  prioridade?: "BAIXA" | "NORMAL" | "ALTA";
  responsavelAssessorId?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

function resolverDataConclusao(dados: DadosDemanda): Date | null {
  if (dados.status === "CONCLUIDO") {
    if (!dados.dataConclusao) {
      throw new Error("Data de conclusão é obrigatória quando o status é Concluído");
    }
    return new Date(dados.dataConclusao);
  }
  return null;
}

export async function criarDemanda(dados: DadosDemanda, usuarioId: number) {
  return prisma.demanda.create({
    data: {
      cidadaoId: dados.cidadaoId,
      bairro: dados.bairro,
      dataAbertura: new Date(dados.dataAbertura),
      responsavelAssessorId: dados.responsavelAssessorId,
      descricao: dados.descricao,
      status: dados.status,
      prioridade: dados.prioridade,
      dataConclusao: resolverDataConclusao(dados),
      criadoPorId: usuarioId,
      atualizadoPorId: usuarioId,
    },
  });
}

export async function listarDemandas(filtros: FiltrosDemanda = {}) {
  const pagina = filtros.pagina ?? 1;
  const tamanhoPagina = filtros.tamanhoPagina ?? 20;

  const where: Prisma.DemandaWhereInput = { ativo: true };

  if (filtros.busca) {
    where.cidadao = { nome: { contains: filtros.busca } };
  }

  if (filtros.status) {
    where.status = filtros.status;
  }

  if (filtros.prioridade) {
    where.prioridade = filtros.prioridade;
  }

  if (filtros.responsavelAssessorId) {
    where.responsavelAssessorId = filtros.responsavelAssessorId;
  }

  if (filtros.dataInicio || filtros.dataFim) {
    where.dataAbertura = {};
    if (filtros.dataInicio) {
      where.dataAbertura.gte = new Date(filtros.dataInicio);
    }
    if (filtros.dataFim) {
      const fimExclusivo = new Date(filtros.dataFim);
      fimExclusivo.setUTCDate(fimExclusivo.getUTCDate() + 1);
      where.dataAbertura.lt = fimExclusivo;
    }
  }

  // Diferente de Atendimento, aqui buscamos TODOS os itens que batem
  // com o where (sem skip/take ainda) porque a ordenação por
  // prioridade acontece em memória (enum sem peso numérico no SQLite,
  // como já resolvemos antes) — precisamos ordenar o conjunto completo
  // ANTES de recortar a página, senão a paginação corta no meio da
  // ordem errada (ex: página 1 traria prioridades misturadas em vez
  // de "ALTA primeiro" de fato).
  const todos = await prisma.demanda.findMany({
    where,
    include: {
      cidadao: { select: { nome: true, bairro: true } },
      responsavelAssessor: { select: { nome: true } },
      anexos: { select: { id: true, nomeArquivo: true } },
    },
    orderBy: { dataAbertura: "desc" },
  });

  const peso = { ALTA: 0, NORMAL: 1, BAIXA: 2 };
  const ordenados = todos.sort((a, b) => peso[a.prioridade] - peso[b.prioridade]);

  const total = ordenados.length;
  const inicio = (pagina - 1) * tamanhoPagina;
  const itens = ordenados.slice(inicio, inicio + tamanhoPagina);

  return {
    itens,
    total,
    pagina,
    totalPaginas: Math.ceil(total / tamanhoPagina),
  };
}

export async function atualizarDemanda(
  id: number,
  dados: DadosDemanda,
  usuarioId: number
) {
  return prisma.demanda.update({
    where: { id },
    data: {
      cidadaoId: dados.cidadaoId,
      bairro: dados.bairro,
      dataAbertura: new Date(dados.dataAbertura),
      responsavelAssessorId: dados.responsavelAssessorId,
      descricao: dados.descricao,
      status: dados.status,
      prioridade: dados.prioridade,
      dataConclusao: resolverDataConclusao(dados),
      atualizadoPorId: usuarioId,
    },
  });
}

export async function inativarDemanda(id: number, usuarioId: number) {
  return prisma.demanda.update({
    where: { id },
    data: {
      ativo: false,
      atualizadoPorId: usuarioId,
    },
  });
}