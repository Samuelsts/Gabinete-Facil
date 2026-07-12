import type { Anexo } from '@/types/electron';

async function fileParaArquivoIpc(file: File) {
  return {
    nomeArquivo: file.name,
    tipo: file.type || 'application/octet-stream',
    tamanho: file.size,
    dados: await file.arrayBuffer(),
  };
}

export async function salvarAnexos(demandaId: number, arquivos: File[]) {
  if (arquivos.length === 0) return [];

  const arquivosIpc = await Promise.all(arquivos.map(fileParaArquivoIpc));
  const res = await window.electronAPI.salvarAnexos(
    'demandas',
    demandaId,
    arquivosIpc,
  );

  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao salvar anexos');
  }
  return res.anexos ?? [];
}

export async function listarAnexos(demandaId: number): Promise<Anexo[]> {
  const res = await window.electronAPI.listarAnexosEntidade(
    'demandas',
    demandaId,
  );
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao listar anexos');
  }
  return res.anexos ?? [];
}

export async function removerAnexo(anexoId: number) {
  const res = await window.electronAPI.removerAnexo('demandas', anexoId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao remover anexo');
  }
}

export async function baixarAnexo(anexoId: number) {
  const res = await window.electronAPI.baixarAnexo('demandas', anexoId);
  if (!res.sucesso) {
    throw new Error(res.erro ?? 'Erro ao baixar anexo');
  }
}
