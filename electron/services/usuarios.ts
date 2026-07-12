import { prisma } from "../db";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

interface DadosUsuario {
  nome: string;
  senha: string;
  perfil: "ADMINISTRADOR" | "EDITOR" | "VISUALIZADOR";
}

export async function criarUsuarioGestao(dados: DadosUsuario) {
  const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);

  const usuario = await prisma.usuario.create({
    data: {
      nome: dados.nome,
      senhaHash,
      perfil: dados.perfil,
      usuarioPadrao: false, // usuários criados pela tela nunca são "padrão"
    },
  });

  const { senhaHash: _, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
}

export async function listarUsuariosGestao() {
  return prisma.usuario.findMany({
    where: { ativo: true },
    select: {
      id: true,
      nome: true,
      perfil: true,
      usuarioPadrao: true,
      ativo: true,
    },
    orderBy: { nome: "asc" },
  });
}

export async function atualizarUsuarioGestao(
  id: number,
  dados: { nome?: string; perfil?: "ADMINISTRADOR" | "EDITOR" | "VISUALIZADOR" }
) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw new Error("Usuário não encontrado");

  // Regra central desta etapa: usuário padrão (Administrador/Editor/
  // Visualizador do seed) não pode ter nome nem perfil alterados —
  // só inativação é permitida. Bloqueado aqui, na camada mais próxima
  // do banco, para que nenhum caminho futuro consiga burlar isso.
  if (usuario.usuarioPadrao) {
    throw new Error("Usuários padrão do sistema não podem ser editados, apenas inativados.");
  }

  const usuarioAtualizado = await prisma.usuario.update({
    where: { id },
    data: dados,
  });

  const { senhaHash: _, ...usuarioSeguro } = usuarioAtualizado;
  return usuarioSeguro;
}

export async function resetarSenhaUsuario(id: number, novaSenha: string) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw new Error("Usuário não encontrado");

  const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);

  await prisma.usuario.update({
    where: { id },
    data: { senhaHash },
  });
}

export async function inativarUsuarioGestao(id: number) {
  return prisma.usuario.update({
    where: { id },
    data: { ativo: false },
  });
}