import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = process.env.SEED_DB_PATH
  ? path.resolve(process.env.SEED_DB_PATH)
  : path.join(__dirname, 'dev.db');

const prisma = new PrismaClient({
  datasourceUrl: `file:${dbPath}`,
});

async function main() {
  // Assessor padrão — independente do bloco de Usuario abaixo,
  // por isso fica ANTES de qualquer return. Cada bloco checa sua
  // própria condição de existência isoladamente.
  const nomeAssessorPadrao = 'Administrador';

  const assessorExistente = await prisma.assessor.findFirst({
    where: { nome: nomeAssessorPadrao },
  });

  if (!assessorExistente) {
    await prisma.assessor.create({
      data: {
        nome: nomeAssessorPadrao,
        assessorPadrao: true,
      },
    });
    console.log('Assessor padrão criado: Administrador');
  } else {
    console.log('Assessor padrão já existe, nada a fazer.');
  }

  // Usuario administrador — bloco independente, com seu próprio
  // early return (que agora só afeta este bloco, não a função toda).
  const usuariosPadrao = [
    { nome: 'Administrador', perfil: 'ADMINISTRADOR' as const },
    { nome: 'Editor', perfil: 'EDITOR' as const },
    { nome: 'Visualizador', perfil: 'VISUALIZADOR' as const },
  ];

  const senhaHash = await bcrypt.hash('admin123', 10);

  for (const dados of usuariosPadrao) {
    const existente = await prisma.usuario.findUnique({
      where: { nome: dados.nome },
    });

    if (existente) {
      console.log(`Usuário ${dados.perfil} já existe, nada a fazer.`);
      continue;
    }

    await prisma.usuario.create({
      data: {
        nome: dados.nome,
        senhaHash,
        perfil: dados.perfil,
        usuarioPadrao: true,
      },
    });
    console.log(
      `Usuário ${dados.perfil} criado: nome de login "${dados.nome}" / senha admin123`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
