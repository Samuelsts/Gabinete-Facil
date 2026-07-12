import { prisma } from '../db';
import type { Prisma } from '@prisma/client';

interface DadosAssessor {
  nome: string;
  celular?: string;
  endereco?: string;
  bairro?: string;
  dataNascimento?: string;
}

interface FiltrosAssessor {
  busca?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export async function criarAssessor(dados: DadosAssessor, usuarioId: number) {
  return prisma.assessor.create({
    data: {
      nome: dados.nome,
      celular: dados.celular,
      endereco: dados.endereco,
      bairro: dados.bairro,
      dataNascimento: dados.dataNascimento
        ? new Date(dados.dataNascimento)
        : undefined,
      criadoPorId: usuarioId,
      atualizadoPorId: usuarioId,
    },
  });
}

export async function listarAssessores(filtros: FiltrosAssessor = {}) {
  const pagina = filtros.pagina ?? 1;
  const tamanhoPagina = filtros.tamanhoPagina ?? 20;

  const where: Prisma.AssessorWhereInput = { ativo: true };

  if (filtros.busca) {
    where.nome = { contains: filtros.busca };
  }

  const [total, itens] = await Promise.all([
    prisma.assessor.count({ where }),
    prisma.assessor.findMany({
      where,
      orderBy: { nome: 'asc' },
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

export async function atualizarAssessor(
  id: number,
  dados: Partial<DadosAssessor>,
  usuarioId: number,
) {
  return prisma.assessor.update({
    where: { id },
    data: {
      ...dados,
      dataNascimento: dados.dataNascimento
        ? new Date(dados.dataNascimento)
        : undefined,
      atualizadoPorId: usuarioId,
    },
  });
}

export async function inativarAssessor(id: number, usuarioId: number) {
  return prisma.assessor.update({
    where: { id },
    data: {
      ativo: false,
      atualizadoPorId: usuarioId,
    },
  });
}
