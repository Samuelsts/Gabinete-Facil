import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  login: (email: string, senha: string) =>
    ipcRenderer.invoke('auth:login', email, senha),

  listarCidadaos: (filtros?: unknown) =>
    ipcRenderer.invoke('cidadaos:listar', filtros),

  criarCidadao: (dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('cidadaos:criar', dados, usuarioId),

  atualizarCidadao: (id: number, dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('cidadaos:atualizar', id, dados, usuarioId),

  inativarCidadao: (id: number, usuarioId: number) =>
    ipcRenderer.invoke('cidadaos:inativar', id, usuarioId),

  listarAssessores: (filtros?: unknown) =>
    ipcRenderer.invoke('assessores:listar', filtros),

  criarAssessor: (dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('assessores:criar', dados, usuarioId),

  atualizarAssessor: (id: number, dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('assessores:atualizar', id, dados, usuarioId),

  inativarAssessor: (id: number, usuarioId: number) =>
    ipcRenderer.invoke('assessores:inativar', id, usuarioId),

  listarAtendimentos: (filtros?: unknown) =>
    ipcRenderer.invoke('atendimentos:listar', filtros),

  criarAtendimento: (dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('atendimentos:criar', dados, usuarioId),

  atualizarAtendimento: (id: number, dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('atendimentos:atualizar', id, dados, usuarioId),

  inativarAtendimento: (id: number, usuarioId: number) =>
    ipcRenderer.invoke('atendimentos:inativar', id, usuarioId),

  salvarAnexos: (
    tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
    entidadeId: number,
    arquivos: {
      nomeArquivo: string;
      tipo: string;
      tamanho: number;
      dados: ArrayBuffer;
    }[],
  ) => ipcRenderer.invoke('anexos:salvar', tipo, entidadeId, arquivos),

  listarAnexosEntidade: (
    tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
    entidadeId: number,
  ) => ipcRenderer.invoke('anexos:listar', tipo, entidadeId),

  removerAnexo: (
    tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
    anexoId: number,
  ) => ipcRenderer.invoke('anexos:remover', tipo, anexoId),

  baixarAnexo: (
    tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
    anexoId: number,
  ) => ipcRenderer.invoke('anexos:baixar', tipo, anexoId),

  listarDemandas: (filtros?: unknown) =>
    ipcRenderer.invoke('demandas:listar', filtros),

  criarDemanda: (dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('demandas:criar', dados, usuarioId),

  atualizarDemanda: (id: number, dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('demandas:atualizar', id, dados, usuarioId),

  inativarDemanda: (id: number, usuarioId: number) =>
    ipcRenderer.invoke('demandas:inativar', id, usuarioId),

  listarIndicacoesOficios: (filtros?: unknown) =>
    ipcRenderer.invoke('indicacoesOficios:listar', filtros),

  criarIndicacaoOficio: (dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('indicacoesOficios:criar', dados, usuarioId),

  atualizarIndicacaoOficio: (id: number, dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('indicacoesOficios:atualizar', id, dados, usuarioId),

  inativarIndicacaoOficio: (id: number, usuarioId: number) =>
    ipcRenderer.invoke('indicacoesOficios:inativar', id, usuarioId),

  listarComunidades: (filtros?: unknown) =>
    ipcRenderer.invoke('comunidades:listar', filtros),

  criarComunidade: (dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('comunidades:criar', dados, usuarioId),

  atualizarComunidade: (id: number, dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('comunidades:atualizar', id, dados, usuarioId),

  inativarComunidade: (id: number, usuarioId: number) =>
    ipcRenderer.invoke('comunidades:inativar', id, usuarioId),

  listarAgenda: (filtros?: unknown) =>
    ipcRenderer.invoke('agenda:listar', filtros),

  criarAgenda: (dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('agenda:criar', dados, usuarioId),

  atualizarAgenda: (id: number, dados: unknown, usuarioId: number) =>
    ipcRenderer.invoke('agenda:atualizar', id, dados, usuarioId),

  inativarAgenda: (id: number, usuarioId: number) =>
    ipcRenderer.invoke('agenda:inativar', id, usuarioId),

  obterDashboard: () => ipcRenderer.invoke('dashboard:obter'),

  aniversariantesCidadaos: (mes: number) =>
    ipcRenderer.invoke('relatorios:aniversariantesCidadaos', mes),

  aniversariantesAssessores: (mes: number) =>
    ipcRenderer.invoke('relatorios:aniversariantesAssessores', mes),

  exportarRelatorioCsv: (dados: unknown) =>
    ipcRenderer.invoke('relatorios:exportarCsv', dados),

  exportarRelatorioExcel: (dados: unknown) =>
    ipcRenderer.invoke('relatorios:exportarExcel', dados),

  exportarRelatorioPdf: (dados: unknown) =>
    ipcRenderer.invoke('relatorios:exportarPdf', dados),

  backupObterConfig: () => ipcRenderer.invoke('backup:obterConfig'),

  backupSalvarConfig: (horarioDiario: string) =>
    ipcRenderer.invoke('backup:salvarConfig', horarioDiario),

  backupExecutarAgora: () => ipcRenderer.invoke('backup:executarAgora'),

  listarUsuariosGestao: () => ipcRenderer.invoke('usuariosGestao:listar'),

  criarUsuarioGestao: (dados: unknown) =>
    ipcRenderer.invoke('usuariosGestao:criar', dados),

  atualizarUsuarioGestao: (id: number, dados: unknown) =>
    ipcRenderer.invoke('usuariosGestao:atualizar', id, dados),

  resetarSenhaUsuarioGestao: (id: number, novaSenha: string) =>
    ipcRenderer.invoke('usuariosGestao:resetarSenha', id, novaSenha),

  inativarUsuarioGestao: (id: number) =>
    ipcRenderer.invoke('usuariosGestao:inativar', id),

  resetarDadosSistema: () => ipcRenderer.invoke('sistema:resetarDados'),

  obterHistoricoCidadao: (cidadaoId: number) =>
    ipcRenderer.invoke('cidadaos:historico', cidadaoId),
});
