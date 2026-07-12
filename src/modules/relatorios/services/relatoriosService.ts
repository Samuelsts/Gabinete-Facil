import type { AniversarianteItem } from "@/types/electron";

export async function listarAniversariantesCidadaos(
  mes: number
): Promise<AniversarianteItem[]> {
  const res = await window.electronAPI.aniversariantesCidadaos(mes);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao buscar aniversariantes");
  }
  return res.itens ?? [];
}

export async function listarAniversariantesAssessores(
  mes: number
): Promise<AniversarianteItem[]> {
  const res = await window.electronAPI.aniversariantesAssessores(mes);
  if (!res.sucesso) {
    throw new Error(res.erro ?? "Erro ao buscar aniversariantes");
  }
  return res.itens ?? [];
}