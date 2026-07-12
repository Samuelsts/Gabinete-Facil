export {};

export interface Cidadao {
  id: number;
  nome: string;
  celular: string | null;
  endereco: string | null;
  bairro: string | null;
  dataNascimento: Date | string | null;
  ativo: boolean;
  criadoPorId: number | null;
  atualizadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DadosCidadaoInput {
  nome: string;
  celular?: string;
  endereco?: string;
  bairro?: string;
  dataNascimento?: string;
}

export interface FiltrosCidadaoInput {
  busca?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface Assessor {
  id: number;
  nome: string;
  celular: string | null;
  endereco: string | null;
  bairro: string | null;
  dataNascimento: Date | string | null;
  ativo: boolean;
  criadoPorId: number | null;
  atualizadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DadosAssessorInput {
  nome: string;
  celular?: string;
  endereco?: string;
  bairro?: string;
  dataNascimento?: string;
}

export interface FiltrosAssessorInput {
  busca?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export type StatusAtendimento = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface Atendimento {
  id: number;
  cidadaoId: number;
  bairro: string | null;
  dataAtendimento: Date | string;
  responsavelAssessorId: number;
  descricao: string | null;
  status: StatusAtendimento;
  dataConclusao: Date | string | null;
  ativo: boolean;
  criadoPorId: number | null;
  atualizadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
  cidadao?: { nome: string; bairro: string | null };
  responsavelAssessor?: { nome: string };
  anexos?: { id: number; nomeArquivo: string }[];
}

export interface DadosAtendimentoInput {
  cidadaoId: number;
  bairro?: string;
  dataAtendimento: string;
  responsavelAssessorId: number;
  descricao?: string;
  status: StatusAtendimento;
  dataConclusao?: string;
}

export interface FiltrosAtendimentoInput {
  busca?: string;
  status?: StatusAtendimento;
  responsavelAssessorId?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export type StatusDemanda = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
export type PrioridadeDemanda = 'BAIXA' | 'NORMAL' | 'ALTA';

export interface Demanda {
  id: number;
  cidadaoId: number;
  bairro: string | null;
  dataAbertura: Date | string;
  responsavelAssessorId: number;
  descricao: string | null;
  status: StatusDemanda;
  prioridade: PrioridadeDemanda;
  dataConclusao: Date | string | null;
  ativo: boolean;
  criadoPorId: number | null;
  atualizadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
  cidadao?: { nome: string; bairro: string | null };
  responsavelAssessor?: { nome: string };
  anexos?: { id: number; nomeArquivo: string }[];
}

export interface DadosDemandaInput {
  cidadaoId: number;
  bairro?: string;
  dataAbertura: string;
  responsavelAssessorId: number;
  descricao?: string;
  status: StatusDemanda;
  prioridade: PrioridadeDemanda;
  dataConclusao?: string;
}

export interface FiltrosDemandaInput {
  busca?: string;
  status?: StatusDemanda;
  prioridade?: PrioridadeDemanda;
  responsavelAssessorId?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export type TipoIndicacaoOficio = 'INDICACAO' | 'OFICIO';
export type StatusIndicacaoOficio = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface IndicacaoOficio {
  id: number;
  tipo: TipoIndicacaoOficio;
  numeroProtocolo: string | null;
  destinatario: string | null;
  dataRegistro: Date | string;
  responsavelAssessorId: number;
  descricao: string | null;
  status: StatusIndicacaoOficio;
  dataConclusao: Date | string | null;
  ativo: boolean;
  criadoPorId: number | null;
  atualizadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
  responsavelAssessor?: { nome: string };
  anexos?: { id: number; nomeArquivo: string }[];
}

export interface DadosIndicacaoOficioInput {
  tipo: TipoIndicacaoOficio;
  numeroProtocolo?: string;
  destinatario?: string;
  dataRegistro: string;
  responsavelAssessorId: number;
  descricao?: string;
  status: StatusIndicacaoOficio;
  dataConclusao?: string;
}

export interface FiltrosIndicacaoOficioInput {
  busca?: string;
  tipo?: TipoIndicacaoOficio;
  status?: StatusIndicacaoOficio;
  responsavelAssessorId?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export type StatusComunidade = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface Comunidade {
  id: number;
  nome: string | null;
  bairro: string;
  descricaoAcao: string | null;
  liderComunidade: string | null;
  responsavelAssessorId: number;
  data: Date | string;
  status: StatusComunidade;
  dataConclusao: Date | string | null;
  ativo: boolean;
  criadoPorId: number | null;
  atualizadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
  responsavelAssessor?: { nome: string };
}

export interface DadosComunidadeInput {
  nome?: string;
  bairro: string;
  descricaoAcao?: string;
  liderComunidade?: string;
  responsavelAssessorId: number;
  data: string;
  status: StatusComunidade;
  dataConclusao?: string;
}

export interface FiltrosComunidadeInput {
  busca?: string;
  status?: StatusComunidade;
  responsavelAssessorId?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export type StatusAgenda = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface AgendaItem {
  id: number;
  data: Date | string;
  nome: string | null;
  bairro: string | null;
  acaoCompromisso: string;
  descricao: string | null;
  status: StatusAgenda;
  dataConclusao: Date | string | null;
  ativo: boolean;
  criadoPorId: number | null;
  atualizadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DadosAgendaInput {
  data: string;
  nome?: string;
  bairro?: string;
  acaoCompromisso: string;
  descricao?: string;
  status: StatusAgenda;
  dataConclusao?: string;
}

export interface FiltrosAgendaInput {
  busca?: string;
  status?: StatusAgenda;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  tamanhoPagina?: number;
}

export interface Anexo {
  id: number;
  entidadeId: number;
  nomeArquivo: string;
  caminho: string;
  tipo: string;
  tamanho: number;
  dataEnvio: Date | string;
}

export interface DashboardDados {
  totalCidadaos: number;
  totalAtendimentos: number;
  demandasAbertas: number;
  agendaHoje: AgendaItem[];
  proximosCompromissos: AgendaItem[];
  aniversariantes: {
    id: number;
    nome: string;
    dataNascimento: Date | string;
  }[];
  atendimentosRecentes: (Atendimento & { cidadao?: { nome: string } })[];
}

export interface DadosRelatorio {
  titulo: string;
  colunas: { chave: string; label: string }[];
  linhas: Record<string, string>[];
}

export interface AniversarianteItem {
  id: number;
  nome: string;
  celular: string | null;
  bairro: string | null;
  dataNascimento: Date | string;
}

// Contrato genérico de paginação, reaproveitado por todo módulo que
// migrar para listagem paginada (Atendimentos primeiro; os outros 6
// módulos seguem o mesmo padrão nas próximas etapas).
export interface ResultadoPaginado<T> {
  itens: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

// Tipo nomeado em vez de union inline: evita o parser do TS se perder
// com intersection (&) e union (|) combinados dentro de um Promise<>
// multi-linha — problema puramente de legibilidade/parsing, não de
// lógica. Nomear o tipo também documenta a intenção: "resposta de uma
// listagem paginada, com sucesso ou erro".
export type RespostaListagem<T> =
  | ({ sucesso: true } & ResultadoPaginado<T>)
  | { sucesso: false; erro: string };

export interface ConfigBackup {
  horarioDiario: string;
  ultimoBackupData: string | null;
}

export type PerfilUsuario = 'ADMINISTRADOR' | 'EDITOR' | 'VISUALIZADOR';

export interface UsuarioGestao {
  id: number;
  nome: string;
  perfil: PerfilUsuario;
  usuarioPadrao: boolean;
  ativo: boolean;
}

export interface DadosUsuarioInput {
  nome: string;
  senha: string;
  perfil: PerfilUsuario;
}

declare global {
  interface Window {
    electronAPI: {
      login: (
        nomeUsuario: string,
        senha: string,
      ) => Promise<{
        sucesso: boolean;
        usuario?: {
          id: number;
          nome: string;
          perfil: string;
          usuarioPadrao: boolean;
        };
        erro?: string;
      }>;

      listarCidadaos: (
        filtros?: FiltrosCidadaoInput,
      ) => Promise<RespostaListagem<Cidadao>>;
      criarCidadao: (
        dados: DadosCidadaoInput,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; cidadao?: Cidadao; erro?: string }>;

      atualizarCidadao: (
        id: number,
        dados: Partial<DadosCidadaoInput>,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; cidadao?: Cidadao; erro?: string }>;

      inativarCidadao: (
        id: number,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      listarAssessores: (
        filtros?: FiltrosAssessorInput,
      ) => Promise<RespostaListagem<Assessor>>;

      criarAssessor: (
        dados: DadosAssessorInput,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; assessor?: Assessor; erro?: string }>;

      atualizarAssessor: (
        id: number,
        dados: Partial<DadosAssessorInput>,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; assessor?: Assessor; erro?: string }>;

      inativarAssessor: (
        id: number,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      listarAtendimentos: (
        filtros?: FiltrosAtendimentoInput,
      ) => Promise<RespostaListagem<Atendimento>>;

      criarAtendimento: (
        dados: DadosAtendimentoInput,
        usuarioId: number,
      ) => Promise<{
        sucesso: boolean;
        atendimento?: Atendimento;
        erro?: string;
      }>;

      atualizarAtendimento: (
        id: number,
        dados: DadosAtendimentoInput,
        usuarioId: number,
      ) => Promise<{
        sucesso: boolean;
        atendimento?: Atendimento;
        erro?: string;
      }>;

      inativarAtendimento: (
        id: number,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      listarDemandas: (
        filtros?: FiltrosDemandaInput,
      ) => Promise<RespostaListagem<Demanda>>;

      criarDemanda: (
        dados: DadosDemandaInput,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; demanda?: Demanda; erro?: string }>;

      atualizarDemanda: (
        id: number,
        dados: DadosDemandaInput,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; demanda?: Demanda; erro?: string }>;

      inativarDemanda: (
        id: number,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      listarIndicacoesOficios: (
        filtros?: FiltrosIndicacaoOficioInput,
      ) => Promise<RespostaListagem<IndicacaoOficio>>;

      criarIndicacaoOficio: (
        dados: DadosIndicacaoOficioInput,
        usuarioId: number,
      ) => Promise<{
        sucesso: boolean;
        indicacaoOficio?: IndicacaoOficio;
        erro?: string;
      }>;

      atualizarIndicacaoOficio: (
        id: number,
        dados: DadosIndicacaoOficioInput,
        usuarioId: number,
      ) => Promise<{
        sucesso: boolean;
        indicacaoOficio?: IndicacaoOficio;
        erro?: string;
      }>;

      inativarIndicacaoOficio: (
        id: number,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      listarComunidades: (
        filtros?: FiltrosComunidadeInput,
      ) => Promise<RespostaListagem<Comunidade>>;

      criarComunidade: (
        dados: DadosComunidadeInput,
        usuarioId: number,
      ) => Promise<{
        sucesso: boolean;
        comunidade?: Comunidade;
        erro?: string;
      }>;

      atualizarComunidade: (
        id: number,
        dados: DadosComunidadeInput,
        usuarioId: number,
      ) => Promise<{
        sucesso: boolean;
        comunidade?: Comunidade;
        erro?: string;
      }>;

      inativarComunidade: (
        id: number,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      listarAgenda: (
        filtros?: FiltrosAgendaInput,
      ) => Promise<RespostaListagem<AgendaItem>>;

      criarAgenda: (
        dados: DadosAgendaInput,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; item?: AgendaItem; erro?: string }>;

      atualizarAgenda: (
        id: number,
        dados: DadosAgendaInput,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; item?: AgendaItem; erro?: string }>;

      inativarAgenda: (
        id: number,
        usuarioId: number,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      salvarAnexos: (
        tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
        entidadeId: number,
        arquivos: {
          nomeArquivo: string;
          tipo: string;
          tamanho: number;
          dados: ArrayBuffer;
        }[],
      ) => Promise<{ sucesso: boolean; anexos?: Anexo[]; erro?: string }>;

      listarAnexosEntidade: (
        tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
        entidadeId: number,
      ) => Promise<{ sucesso: boolean; anexos?: Anexo[]; erro?: string }>;

      removerAnexo: (
        tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
        anexoId: number,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      baixarAnexo: (
        tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
        anexoId: number,
      ) => Promise<{ sucesso: boolean; cancelado?: boolean; erro?: string }>;

      obterDashboard: () => Promise<{
        sucesso: boolean;
        dados?: DashboardDados;
        erro?: string;
      }>;

      exportarRelatorioCsv: (
        dados: DadosRelatorio,
      ) => Promise<{ sucesso: boolean; cancelado?: boolean; erro?: string }>;

      exportarRelatorioExcel: (
        dados: DadosRelatorio,
      ) => Promise<{ sucesso: boolean; cancelado?: boolean; erro?: string }>;

      exportarRelatorioPdf: (
        dados: DadosRelatorio,
      ) => Promise<{ sucesso: boolean; cancelado?: boolean; erro?: string }>;

      aniversariantesCidadaos: (mes: number) => Promise<{
        sucesso: boolean;
        itens?: AniversarianteItem[];
        erro?: string;
      }>;

      aniversariantesAssessores: (mes: number) => Promise<{
        sucesso: boolean;
        itens?: AniversarianteItem[];
        erro?: string;
      }>;

      backupObterConfig: () => Promise<{
        sucesso: boolean;
        config?: ConfigBackup;
        erro?: string;
      }>;

      backupSalvarConfig: (
        horarioDiario: string,
      ) => Promise<{ sucesso: boolean; config?: ConfigBackup; erro?: string }>;

      backupExecutarAgora: () => Promise<{
        sucesso: boolean;
        caminho?: string;
        erro?: string;
      }>;

      listarUsuariosGestao: () => Promise<{
        sucesso: boolean;
        usuarios?: UsuarioGestao[];
        erro?: string;
      }>;

      criarUsuarioGestao: (dados: DadosUsuarioInput) => Promise<{
        sucesso: boolean;
        usuario?: UsuarioGestao;
        erro?: string;
      }>;

      atualizarUsuarioGestao: (
        id: number,
        dados: { nome?: string; perfil?: PerfilUsuario },
      ) => Promise<{
        sucesso: boolean;
        usuario?: UsuarioGestao;
        erro?: string;
      }>;

      resetarSenhaUsuarioGestao: (
        id: number,
        novaSenha: string,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      inativarUsuarioGestao: (
        id: number,
      ) => Promise<{ sucesso: boolean; erro?: string }>;

      resetarDadosSistema: () => Promise<{
        sucesso: boolean;
        caminhoBackup?: string;
        erro?: string;
      }>;
    };
  }
}
