import { prisma } from "../db";
import type { Prisma } from "@prisma/client";

interface DadosComunidade {
  nome?: string;
  bairro: string;
  descricaoAcao?: string;
  liderComunidade?: string;
  responsavelAssessorId: number;
  data: string;
  status: "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO";
  dataConclusao?: string;
}

interface FiltrosComunidade {
  busca?: string;
  status?: "ABERTO" | "EM_ANDAMENTO" | "CONCLUIDO";
  responsavelAssessorId?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

function resolverDataConclusao(dados: DadosComunidade): Date | null {
  if (dados.status === "CONCLUIDO") {
    if (!dados.dataConclusao) {
      throw new Error("Data de conclusão é obrigatória quando o status é Concluído");
    }
    return new Date(dados.dataConclusao);
  }
  return null;
}

export async function criarComunidade(dados: DadosComunidade, usuarioId: number) {
  return prisma.comunidade.create({
    data: {
      nome: dados.nome,
      bairro: dados.bairro,
      descricaoAcao: dados.descricaoAcao,
      liderComunidade: dados.liderComunidade,
      responsavelAssessorId: dados.responsavelAssessorId,
      data: new Date(dados.data),
      status: dados.status,
      dataConclusao: resolverDataConclusao(dados),
      criadoPorId: usuarioId,
      atualizadoPorId: usuarioId,
    },
  });
}

export async function listarComunidades(filtros: FiltrosComunidade = {}) {
  const pagina = filtros.pagina ?? 1;
  const tamanhoPagina = filtros.tamanhoPagina ?? 20;

  const where: Prisma.ComunidadeWhereInput = { ativo: true };

  if (filtros.busca) {
    where.OR = [
      { bairro: { contains: filtros.busca } },
      { nome: { contains: filtros.busca } },
    ];
  }

  if (filtros.status) {
    where.status = filtros.status;
  }

  if (filtros.responsavelAssessorId) {
    where.responsavelAssessorId = filtros.responsavelAssessorId;
  }

  if (filtros.dataInicio || filtros.dataFim) {
    where.data = {};
    if (filtros.dataInicio) {
      where.data.gte = new Date(filtros.dataInicio);
    }
    if (filtros.dataFim) {
      const fimExclusivo = new Date(filtros.dataFim);
      fimExclusivo.setUTCDate(fimExclusivo.getUTCDate() + 1);
      where.data.lt = fimExclusivo;
    }
  }

  // Sem ordenação por enum aqui (só status, sem prioridade), então
  // skip/take direto no SQL — mesmo caso de Indicações/Ofícios.
  const [total, itens] = await Promise.all([
    prisma.comunidade.count({ where }),
    prisma.comunidade.findMany({
      where,
      include: {
        responsavelAssessor: { select: { nome: true } },
      },
      orderBy: { data: "desc" },
      skip: (pagina - 1) * tamanhoPagina,
      take: tamanhoPagina,
    }),
  ]);

  return {
    itens,
    total,
    pagina,
    totalPaginas: Math.ceil(total / tamanhoPagina),
  };
}

export async function atualizarComunidade(
  id: number,
  dados: DadosComunidade,
  usuarioId: number
) {
  return prisma.comunidade.update({
    where: { id },
    data: {
      nome: dados.nome,
      bairro: dados.bairro,
      descricaoAcao: dados.descricaoAcao,
      liderComunidade: dados.liderComunidade,
      responsavelAssessorId: dados.responsavelAssessorId,
      data: new Date(dados.data),
      status: dados.status,
      dataConclusao: resolverDataConclusao(dados),
      atualizadoPorId: usuarioId,
    },
  });
}

export async function inativarComunidade(id: number, usuarioId: number) {
  return prisma.comunidade.update({
    where: { id },
    data: {
      ativo: false,
      atualizadoPorId: usuarioId,
    },
  });
}