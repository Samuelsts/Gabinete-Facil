import { prisma } from '../db';
import type { Prisma } from '@prisma/client';

interface DadosAgenda {
  data: string;
  nome?: string;
  bairro?: string;
  acaoCompromisso: string;
  descricao?: string;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  dataConclusao?: string;
}

interface FiltrosAgenda {
  busca?: string;
  status?: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

function resolverDataConclusao(dados: DadosAgenda): Date | null {
  if (dados.status === 'CONCLUIDO') {
    if (!dados.dataConclusao) {
      throw new Error(
        'Data de conclusão é obrigatória quando o status é Concluído',
      );
    }
    return new Date(dados.dataConclusao);
  }
  return null;
}

export async function criarAgenda(dados: DadosAgenda, usuarioId: number) {
  return prisma.agenda.create({
    data: {
      data: new Date(dados.data),
      nome: dados.nome,
      bairro: dados.bairro,
      acaoCompromisso: dados.acaoCompromisso,
      descricao: dados.descricao,
      status: dados.status,
      dataConclusao: resolverDataConclusao(dados),
      criadoPorId: usuarioId,
      atualizadoPorId: usuarioId,
    },
  });
}

export async function listarAgenda(filtros: FiltrosAgenda = {}) {
  const pagina = filtros.pagina ?? 1;
  const tamanhoPagina = filtros.tamanhoPagina ?? 20;

  const where: Prisma.AgendaWhereInput = { ativo: true };

  if (filtros.busca) {
    where.OR = [
      { acaoCompromisso: { contains: filtros.busca } },
      { nome: { contains: filtros.busca } },
      { bairro: { contains: filtros.busca } },
    ];
  }

  if (filtros.status) {
    where.status = filtros.status;
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

  const [total, itens] = await Promise.all([
    prisma.agenda.count({ where }),
    prisma.agenda.findMany({
      where,
      // Mantemos "asc" (próximos compromissos primeiro), igual à
      // versão anterior sem paginação — é a ordem que faz sentido
      // pra uma agenda, diferente dos outros módulos que usam "desc".
      orderBy: { data: 'asc' },
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

export async function atualizarAgenda(
  id: number,
  dados: DadosAgenda,
  usuarioId: number,
) {
  return prisma.agenda.update({
    where: { id },
    data: {
      data: new Date(dados.data),
      nome: dados.nome,
      bairro: dados.bairro,
      acaoCompromisso: dados.acaoCompromisso,
      descricao: dados.descricao,
      status: dados.status,
      dataConclusao: resolverDataConclusao(dados),
      atualizadoPorId: usuarioId,
    },
  });
}

export async function inativarAgenda(id: number, usuarioId: number) {
  return prisma.agenda.update({
    where: { id },
    data: {
      ativo: false,
      atualizadoPorId: usuarioId,
    },
  });
}
