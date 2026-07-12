import bcrypt from "bcryptjs";
import { prisma } from "../db";

const SALT_ROUNDS = 10;

export async function criarUsuario(dados: {
  nome: string;
  senha: string;
  perfil: "ADMINISTRADOR" | "EDITOR" | "VISUALIZADOR";
  usuarioPadrao?: boolean;
}) {
  const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);
  return prisma.usuario.create({
    data: {
      nome: dados.nome,
      senhaHash,
      perfil: dados.perfil,
      usuarioPadrao: dados.usuarioPadrao ?? false,
    },
  });
}

export async function autenticar(nome: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({ where: { nome } });

  if (!usuario || !usuario.ativo) {
    throw new Error("Credenciais inválidas");
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaCorreta) {
    throw new Error("Credenciais inválidas");
  }

  const { senhaHash, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
}