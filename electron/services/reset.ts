import { prisma } from '../db';
import { realizarBackup } from './backup';

export async function resetarDadosSistema(): Promise<{
  caminhoBackup: string;
}> {
  const { caminho } = await realizarBackup();

  await prisma.atendimentoAnexo.deleteMany();
  await prisma.demandaAnexo.deleteMany();
  await prisma.indicacaoOficioAnexo.deleteMany();

  await prisma.atendimento.deleteMany();
  await prisma.demanda.deleteMany();
  await prisma.indicacaoOficio.deleteMany();
  await prisma.comunidade.deleteMany();
  await prisma.agenda.deleteMany();
  await prisma.cidadao.deleteMany();

  // Assessores: mantém só o "Administrador" padrão do seed (marcado
  // no cadastro do assessor com o mesmo nome usado no seed original).
  // Qualquer assessor personalizado criado depois é removido.
  await prisma.assessor.deleteMany({
    where: { assessorPadrao: false },
  });

  // Usuários: os 3 padrão (usuarioPadrao: true) ficam intactos;
  // qualquer usuário personalizado criado pela tela é removido.
  await prisma.usuario.deleteMany({
    where: { usuarioPadrao: false },
  });

  return { caminhoBackup: caminho };
}
