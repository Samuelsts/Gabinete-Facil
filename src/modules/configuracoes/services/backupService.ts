import type { ConfigBackup } from "@/types/electron";

export async function obterConfigBackup(): Promise<ConfigBackup> {
  const res = await window.electronAPI.backupObterConfig();
  if (!res.sucesso || !res.config) {
    throw new Error(res.erro ?? "Erro ao obter configuração de backup");
  }
  return res.config;
}

export async function salvarConfigBackup(horarioDiario: string): Promise<ConfigBackup> {
  const res = await window.electronAPI.backupSalvarConfig(horarioDiario);
  if (!res.sucesso || !res.config) {
    throw new Error(res.erro ?? "Erro ao salvar configuração de backup");
  }
  return res.config;
}

export async function executarBackupAgora(): Promise<string> {
  const res = await window.electronAPI.backupExecutarAgora();
  if (!res.sucesso || !res.caminho) {
    throw new Error(res.erro ?? "Erro ao executar backup");
  }
  return res.caminho;
}