import { prisma } from "../db";

export async function obterDashboard() {
  // Início e fim do dia de hoje, em UTC — como discutimos antes,
  // o SQLite guarda tudo em UTC, então comparar contra "hoje" precisa
  // ser feito nesse mesmo fuso para não incluir/excluir registros
  // por um deslocamento de fuso horário.
  const hoje = new Date();
  const inicioHoje = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
  const fimHoje = new Date(inicioHoje);
  fimHoje.setUTCDate(fimHoje.getUTCDate() + 1);

  // Promise.all: todas essas consultas são independentes entre si,
  // então rodam em paralelo em vez de sequencialmente — reduz o tempo
  // total de resposta do dashboard, que é uma tela que o usuário
  // provavelmente abre com frequência (tela inicial do sistema).
  const [
    totalCidadaos,
    totalAtendimentos,
    demandasAbertas,
    agendaHoje,
    proximosCompromissos,
    atendimentosRecentes,
  ] = await Promise.all([
    prisma.cidadao.count({ where: { ativo: true } }),

    prisma.atendimento.count({ where: { ativo: true } }),

    prisma.demanda.count({
      where: { ativo: true, status: { in: ["ABERTO", "EM_ANDAMENTO"] } },
    }),

    prisma.agenda.findMany({
      where: {
        ativo: true,
        data: { gte: inicioHoje, lt: fimHoje },
      },
      orderBy: { data: "asc" },
    }),

    // Próximos compromissos = a partir de amanhã, limitado a 5 —
    // evita que o dashboard fique poluído com uma lista longa;
    // quem quiser ver tudo, acessa o módulo Agenda completo.
    prisma.agenda.findMany({
      where: { ativo: true, data: { gte: fimHoje } },
      orderBy: { data: "asc" },
      take: 5,
    }),

    prisma.atendimento.findMany({
      where: { ativo: true },
      include: { cidadao: { select: { nome: true } } },
      orderBy: { dataAtendimento: "desc" },
      take: 5,
    }),
  ]);

  // Aniversariantes do mês: SQLite não tem uma função nativa simples
  // de "extrair mês de uma data" acessível diretamente via Prisma sem
  // SQL raw, então buscamos os cidadãos com data de nascimento
  // preenchida e filtramos em JS. Aceitável aqui pelo mesmo motivo já
  // usado na ordenação por prioridade de Demandas: volume de dados
  // pequeno (uso local de gabinete), sem necessidade de otimizar
  // prematuramente com SQL raw.
  const cidadaosComNascimento = await prisma.cidadao.findMany({
    where: { ativo: true, dataNascimento: { not: null } },
    select: { id: true, nome: true, dataNascimento: true },
  });

  const mesAtual = hoje.getUTCMonth();
  const aniversariantes = cidadaosComNascimento
    .filter((c) => c.dataNascimento && new Date(c.dataNascimento).getUTCMonth() === mesAtual)
    .sort(
      (a, b) =>
        new Date(a.dataNascimento!).getUTCDate() - new Date(b.dataNascimento!).getUTCDate()
    );

  return {
    totalCidadaos,
    totalAtendimentos,
    demandasAbertas,
    agendaHoje,
    proximosCompromissos,
    aniversariantes,
    atendimentosRecentes,
  };
}