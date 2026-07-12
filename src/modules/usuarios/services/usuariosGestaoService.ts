import type { UsuarioGestao, DadosUsuarioInput, PerfilUsuario } from "@/types/electron";

export async function listarUsuariosGestao(): Promise<UsuarioGestao[]> {
  const res = await window.electronAPI.listarUsuariosGestao();
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao listar usuários");
  }
  return res.usuarios ?? [];
}

export async function criarUsuarioGestao(dados: DadosUsuarioInput) {
  const res = await window.electronAPI.criarUsuarioGestao(dados);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao criar usuário");
  }
  return res.usuario;
}

export async function atualizarUsuarioGestao(
  id: number,
  dados: { nome?: string; perfil?: PerfilUsuario }
) {
  const res = await window.electronAPI.atualizarUsuarioGestao(id, dados);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao atualizar usuário");
  }
  return res.usuario;
}

export async function resetarSenhaUsuarioGestao(id: number, novaSenha: string) {
  const res = await window.electronAPI.resetarSenhaUsuarioGestao(id, novaSenha);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao resetar senha");
  }
}

export async function inativarUsuarioGestao(id: number) {
  const res = await window.electronAPI.inativarUsuarioGestao(id);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao inativar usuário");
  }
}

export async function resetarDadosSistema(): Promise<string> {
  const res = await window.electronAPI.resetarDadosSistema();
  if (!res.sucesso || !res.caminhoBackup) {
    throw new Error(res.erro ?? "Erro ao resetar dados");
  }
  return res.caminhoBackup;
}