import type { DashboardDados } from "@/types/electron";

export async function obterDashboard(): Promise<DashboardDados> {
  const res = await window.electronAPI.obterDashboard();
  if (!res.sucesso || !res.dados) {
    throw new Error(res.erro ?? "Erro ao carregar dashboard");
  }
  return res.dados;
}