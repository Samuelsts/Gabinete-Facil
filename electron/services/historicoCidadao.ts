import { prisma } from '../db';

const LIMITE_ITENS = 5;

export async function obterHistoricoCidadao(cidadaoId: number) {
  // Busca em paralelo — as duas consultas são independentes entre si.
  const [atendimentos, demandas] = await Promise.all([
    prisma.atendimento.findMany({
      where: { cidadaoId, ativo: true },
      include: {
        responsavelAssessor: { select: { nome: true } },
      },
      orderBy: { dataAtendimento: 'desc' },
      take: LIMITE_ITENS,
    }),

    prisma.demanda.findMany({
      where: { cidadaoId, ativo: true },
      include: {
        responsavelAssessor: { select: { nome: true } },
      },
      orderBy: { dataAbertura: 'desc' },
      take: LIMITE_ITENS,
    }),
  ]);

  return { atendimentos, demandas };
}
