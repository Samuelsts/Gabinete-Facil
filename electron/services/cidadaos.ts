import { prisma } from '../db';
import type { Prisma } from '@prisma/client';

interface DadosCidadao {
  nome: string;
  celular?: string;
  endereco?: string;
  bairro?: string;
  dataNascimento?: string;
}

interface FiltrosCidadao {
  busca?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export async function criarCidadao(dados: DadosCidadao, usuarioId: number) {
  return prisma.cidadao.create({
    data: {
      ...dados,
      dataNascimento: dados.dataNascimento
        ? new Date(dados.dataNascimento)
        : undefined,
      criadoPorId: usuarioId,
      atualizadoPorId: usuarioId,
    },
  });
}

export async function listarCidadaos(filtros: FiltrosCidadao = {}) {
  const pagina = filtros.pagina ?? 1;
  const tamanhoPagina = filtros.tamanhoPagina ?? 20;

  const where: Prisma.CidadaoWhereInput = { ativo: true };

  if (filtros.busca) {
    where.nome = { contains: filtros.busca };
  }

  const [total, itens] = await Promise.all([
    prisma.cidadao.count({ where }),
    prisma.cidadao.findMany({
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

export async function atualizarCidadao(
  id: number,
  dados: Partial<DadosCidadao>,
  usuarioId: number,
) {
  return prisma.cidadao.update({
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

export async function inativarCidadao(id: number, usuarioId: number) {
  return prisma.cidadao.update({
    where: { id },
    data: {
      ativo: false,
      atualizadoPorId: usuarioId,
    },
  });
}
