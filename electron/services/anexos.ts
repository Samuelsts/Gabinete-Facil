import { prisma } from "../db";
import fs from "fs";
import path from "path";
import { pastaUploads } from "../config/paths";

type TipoEntidadeAnexo = "atendimentos" | "demandas" | "indicacoesOficios";

interface ArquivoRecebido {
  nomeArquivo: string;
  tipo: string;
  tamanho: number;
  dados: ArrayBuffer;
}

const TAMANHO_MAXIMO_BYTES = 25 * 1024 * 1024;

function pastaBaseUploads(): string {
  return pastaUploads();
}

function pastaUploadsEntidade(
  tipo: TipoEntidadeAnexo,
  entidadeId: number
): string {
  return path.join(pastaBaseUploads(), tipo, String(entidadeId));
}

function delegatePrisma(tipo: TipoEntidadeAnexo) {
  if (tipo === "atendimentos") return prisma.atendimentoAnexo;
  if (tipo === "demandas") return prisma.demandaAnexo;
  return prisma.indicacaoOficioAnexo;
}

function campoRelacao(tipo: TipoEntidadeAnexo) {
  if (tipo === "atendimentos") return "atendimentoId";
  if (tipo === "demandas") return "demandaId";
  return "indicacaoOficioId";
}

export async function salvarAnexos(
  tipo: TipoEntidadeAnexo,
  entidadeId: number,
  arquivos: ArquivoRecebido[]
) {
  const pasta = pastaUploadsEntidade(tipo, entidadeId);
  fs.mkdirSync(pasta, { recursive: true });

  const anexosCriados = [];

  for (const arquivo of arquivos) {
    if (arquivo.tamanho > TAMANHO_MAXIMO_BYTES) {
      throw new Error(
        `Arquivo "${arquivo.nomeArquivo}" excede o limite de 25MB`
      );
    }

    const caminhoCompleto = path.join(pasta, arquivo.nomeArquivo);
    fs.writeFileSync(caminhoCompleto, Buffer.from(arquivo.dados));

    // @ts-expect-error — o Prisma Client não tem um tipo unificado para
    // "create de qualquer um dos três delegates" com campo de FK de
    // nome variável; o cast manual aqui é seguro porque campoRelacao
    // garante a chave certa para o tipo correspondente.
    const registro = await delegatePrisma(tipo).create({
      data: {
        [campoRelacao(tipo)]: entidadeId,
        nomeArquivo: arquivo.nomeArquivo,
        caminho: path.join(tipo, String(entidadeId), arquivo.nomeArquivo),
        tipo: arquivo.tipo,
        tamanho: arquivo.tamanho,
      },
    });

    anexosCriados.push(registro);
  }

  return anexosCriados;
}

export async function listarAnexos(tipo: TipoEntidadeAnexo, entidadeId: number) {
  // @ts-expect-error — mesmo motivo do create acima.
  return delegatePrisma(tipo).findMany({
    where: { [campoRelacao(tipo)]: entidadeId },
    orderBy: { dataEnvio: "asc" },
  });
}

export async function removerAnexo(tipo: TipoEntidadeAnexo, anexoId: number) {
  // @ts-expect-error — mesmo motivo do create acima.
  const anexo = await delegatePrisma(tipo).findUnique({
    where: { id: anexoId },
  });
  if (!anexo) return;

  const caminhoCompleto = path.join(pastaBaseUploads(), anexo.caminho);

  if (fs.existsSync(caminhoCompleto)) {
    fs.unlinkSync(caminhoCompleto);
  }

  // @ts-expect-error — mesmo motivo do create acima.
  await delegatePrisma(tipo).delete({ where: { id: anexoId } });
}

export async function caminhoAbsolutoAnexo(
  tipo: TipoEntidadeAnexo,
  anexoId: number
): Promise<{ caminho: string; nomeArquivo: string } | null> {
  // @ts-expect-error — mesmo motivo do create acima.
  const anexo = await delegatePrisma(tipo).findUnique({
    where: { id: anexoId },
  });
  if (!anexo) return null;

  return {
    caminho: path.join(pastaBaseUploads(), anexo.caminho),
    nomeArquivo: anexo.nomeArquivo,
  };
}