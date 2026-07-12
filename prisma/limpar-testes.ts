import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient({
  datasourceUrl: `file:${path.join(__dirname, "dev.db")}`,
});

async function main() {
  // Ordem importa: precisa apagar os anexos (filhos) antes das
  // entidades (pais), senão a FK impede a exclusão do pai.
  await prisma.atendimentoAnexo.deleteMany();
  await prisma.demandaAnexo.deleteMany();
  await prisma.indicacaoOficioAnexo.deleteMany();

  await prisma.atendimento.deleteMany();
  await prisma.demanda.deleteMany();
  await prisma.indicacaoOficio.deleteMany();
  await prisma.comunidade.deleteMany();
  // Agenda não tem FK de responsável, mas limpamos também por ser dado de teste.
  await prisma.agenda.deleteMany();

  console.log("Dados de teste removidos de: Atendimentos, Demandas, Indicações/Ofícios, Comunidades, Agenda (e seus anexos).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());