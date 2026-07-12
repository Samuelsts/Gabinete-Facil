import { prisma } from '../db';
import type { Prisma } from '@prisma/client';

interface DadosIndicacaoOficio {
  tipo: 'INDICACAO' | 'OFICIO';
  numeroProtocolo?: string;
  destinatario?: string;
  dataRegistro: string;
  responsavelAssessorId: number;
  descricao?: string;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  dataConclusao?: string;
}

interface FiltrosIndicacaoOficio {
  busca?: string;
  tipo?: 'INDICACAO' | 'OFICIO';
  status?: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
  responsavelAssessorId?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

function resolverDataConclusao(dados: DadosIndicacaoOficio): Date | null {
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

export async function criarIndicacaoOficio(
  dados: DadosIndicacaoOficio,
  usuarioId: number,
) {
  return prisma.indicacaoOficio.create({
    data: {
      tipo: dados.tipo,
      numeroProtocolo: dados.numeroProtocolo,
      destinatario: dados.destinatario,
      dataRegistro: new Date(dados.dataRegistro),
      responsavelAssessorId: dados.responsavelAssessorId,
      descricao: dados.descricao,
      status: dados.status,
      dataConclusao: resolverDataConclusao(dados),
      criadoPorId: usuarioId,
      atualizadoPorId: usuarioId,
    },
  });
}

export async function listarIndicacoesOficios(
  filtros: FiltrosIndicacaoOficio = {},
) {
  const pagina = filtros.pagina ?? 1;
  const tamanhoPagina = filtros.tamanhoPagina ?? 20;

  const where: Prisma.IndicacaoOficioWhereInput = { ativo: true };

  if (filtros.busca) {
    where.OR = [
      { destinatario: { contains: filtros.busca } },
      { numeroProtocolo: { contains: filtros.busca } },
    ];
  }

  if (filtros.tipo) {
    where.tipo = filtros.tipo;
  }

  if (filtros.status) {
    where.status = filtros.status;
  }

  if (filtros.responsavelAssessorId) {
    where.responsavelAssessorId = filtros.responsavelAssessorId;
  }

  if (filtros.dataInicio || filtros.dataFim) {
    where.dataRegistro = {};
    if (filtros.dataInicio) {
      where.dataRegistro.gte = new Date(filtros.dataInicio);
    }
    if (filtros.dataFim) {
      const fimExclusivo = new Date(filtros.dataFim);
      fimExclusivo.setUTCDate(fimExclusivo.getUTCDate() + 1);
      where.dataRegistro.lt = fimExclusivo;
    }
  }

  // Aqui não há ordenação por peso de enum (diferente de Demandas),
  // então skip/take acontece direto no SQL — mais eficiente, não
  // precisa trazer a tabela inteira para memória.
  const [total, itens] = await Promise.all([
    prisma.indicacaoOficio.count({ where }),
    prisma.indicacaoOficio.findMany({
      where,
      include: {
        responsavelAssessor: { select: { nome: true } },
        anexos: { select: { id: true, nomeArquivo: true } },
      },
      orderBy: { dataRegistro: 'desc' },
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

export async function atualizarIndicacaoOficio(
  id: number,
  dados: DadosIndicacaoOficio,
  usuarioId: number,
) {
  return prisma.indicacaoOficio.update({
    where: { id },
    data: {
      tipo: dados.tipo,
      numeroProtocolo: dados.numeroProtocolo,
      destinatario: dados.destinatario,
      dataRegistro: new Date(dados.dataRegistro),
      responsavelAssessorId: dados.responsavelAssessorId,
      descricao: dados.descricao,
      status: dados.status,
      dataConclusao: resolverDataConclusao(dados),
      atualizadoPorId: usuarioId,
    },
  });
}

export async function inativarIndicacaoOficio(id: number, usuarioId: number) {
  return prisma.indicacaoOficio.update({
    where: { id },
    data: {
      ativo: false,
      atualizadoPorId: usuarioId,
    },
  });
}
