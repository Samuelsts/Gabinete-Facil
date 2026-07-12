import { prisma } from '../db';
import type { Prisma } from '@prisma/client';

interface DadosAtendimento {
  cidadaoId: number;
  bairro?: string;
  dataAtendimento: string;
  responsavelAssessorId: number;
  descricao?: string;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  dataConclusao?: string;
}

interface FiltrosAtendimento {
  busca?: string;
  status?: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  responsavelAssessorId?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

function resolverDataConclusao(dados: DadosAtendimento): Date | null {
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

export async function criarAtendimento(
  dados: DadosAtendimento,
  usuarioId: number,
) {
  return prisma.atendimento.create({
    data: {
      cidadaoId: dados.cidadaoId,
      bairro: dados.bairro,
      dataAtendimento: new Date(dados.dataAtendimento),
      responsavelAssessorId: dados.responsavelAssessorId,
      descricao: dados.descricao,
      status: dados.status,
      dataConclusao: resolverDataConclusao(dados),
      criadoPorId: usuarioId,
      atualizadoPorId: usuarioId,
    },
  });
}

export async function listarAtendimentos(filtros: FiltrosAtendimento = {}) {
  const pagina = filtros.pagina ?? 1;
  const tamanhoPagina = filtros.tamanhoPagina ?? 20;

  // Monta o `where` incrementalmente. Cada filtro só entra no objeto
  // se foi realmente informado — isso evita, por exemplo, um
  // `status: undefined` explícito no Prisma (que tecnicamente é
  // ignorado por ele, mas deixar implícito aqui documenta a intenção:
  // "filtro ausente = não filtra por isso", não "filtra por vazio").
  const where: Prisma.AtendimentoWhereInput = { ativo: true };

  if (filtros.busca) {
    where.cidadao = { nome: { contains: filtros.busca } };
  }

  if (filtros.status) {
    where.status = filtros.status;
  }

  if (filtros.responsavelAssessorId) {
    where.responsavelAssessorId = filtros.responsavelAssessorId;
  }

  // Filtro de período: gte (maior ou igual) combinado com lt do dia
  // seguinte ao invés de lte, pelo mesmo motivo do dashboard — datas
  // no SQLite são timestamps completos (meia-noite UTC), então um
  // "até 15/07" com lte pegaria só 15/07 00:00:00, excluindo o resto
  // do dia 15. Com lt do dia 16, o dia 15 inteiro entra corretamente.
  if (filtros.dataInicio || filtros.dataFim) {
    where.dataAtendimento = {};
    if (filtros.dataInicio) {
      where.dataAtendimento.gte = new Date(filtros.dataInicio);
    }
    if (filtros.dataFim) {
      const fimExclusivo = new Date(filtros.dataFim);
      fimExclusivo.setUTCDate(fimExclusivo.getUTCDate() + 1);
      where.dataAtendimento.lt = fimExclusivo;
    }
  }

  // total e itens em paralelo: count() e findMany() são consultas
  // independentes contra o mesmo where, não há razão para serializar.
  const [total, itens] = await Promise.all([
    prisma.atendimento.count({ where }),
    prisma.atendimento.findMany({
      where,
      include: {
        cidadao: { select: { nome: true, bairro: true } },
        responsavelAssessor: { select: { nome: true } },
        anexos: { select: { id: true, nomeArquivo: true } },
      },
      orderBy: { dataAtendimento: 'desc' },
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

export async function atualizarAtendimento(
  id: number,
  dados: DadosAtendimento,
  usuarioId: number,
) {
  return prisma.atendimento.update({
    where: { id },
    data: {
      cidadaoId: dados.cidadaoId,
      bairro: dados.bairro,
      dataAtendimento: new Date(dados.dataAtendimento),
      responsavelAssessorId: dados.responsavelAssessorId,
      descricao: dados.descricao,
      status: dados.status,
      dataConclusao: resolverDataConclusao(dados),
      atualizadoPorId: usuarioId,
    },
  });
}

export async function inativarAtendimento(id: number, usuarioId: number) {
  return prisma.atendimento.update({
    where: { id },
    data: {
      ativo: false,
      atualizadoPorId: usuarioId,
    },
  });
}
