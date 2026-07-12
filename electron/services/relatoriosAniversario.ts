import { prisma } from "../db";

// Reaproveita exatamente a mesma técnica do dashboard.ts: SQLite não
// tem uma forma direta e portável de "extrair mês de uma coluna
// DateTime" via Prisma sem SQL raw, então filtramos em memória depois
// de trazer só os registros com data de nascimento preenchida.
// Aceitável pelo mesmo motivo já justificado antes: volume de dados
// de um gabinete não exige otimização prematura aqui.

export async function listarAniversariantesCidadaos(mes: number) {
  const cidadaos = await prisma.cidadao.findMany({
    where: { ativo: true, dataNascimento: { not: null } },
    select: {
      id: true,
      nome: true,
      celular: true,
      bairro: true,
      dataNascimento: true,
    },
  });

  return cidadaos
    .filter((c) => new Date(c.dataNascimento!).getUTCMonth() === mes)
    .sort(
      (a, b) =>
        new Date(a.dataNascimento!).getUTCDate() -
        new Date(b.dataNascimento!).getUTCDate()
    );
}

export async function listarAniversariantesAssessores(mes: number) {
  const assessores = await prisma.assessor.findMany({
    where: { ativo: true, dataNascimento: { not: null } },
    select: {
      id: true,
      nome: true,
      celular: true,
      bairro: true,
      dataNascimento: true,
    },
  });

  return assessores
    .filter((a) => new Date(a.dataNascimento!).getUTCMonth() === mes)
    .sort(
      (a, b) =>
        new Date(a.dataNascimento!).getUTCDate() -
        new Date(b.dataNascimento!).getUTCDate()
    );
}