import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { criarUsuario, autenticar } from './services/auth';

import {
  criarCidadao,
  listarCidadaos,
  atualizarCidadao,
  inativarCidadao,
} from './services/cidadaos';
import {
  criarAtendimento,
  listarAtendimentos,
  atualizarAtendimento,
  inativarAtendimento,
} from './services/atendimentos';
import {
  salvarAnexos,
  listarAnexos,
  removerAnexo,
  caminhoAbsolutoAnexo,
} from './services/anexos';
import fs from 'fs';
import {
  criarDemanda,
  listarDemandas,
  atualizarDemanda,
  inativarDemanda,
} from './services/demandas';
import {
  criarIndicacaoOficio,
  listarIndicacoesOficios,
  atualizarIndicacaoOficio,
  inativarIndicacaoOficio,
} from './services/indicacoesOficios';
import {
  criarComunidade,
  listarComunidades,
  atualizarComunidade,
  inativarComunidade,
} from './services/comunidades';
import {
  criarAgenda,
  listarAgenda,
  atualizarAgenda,
  inativarAgenda,
} from './services/agenda';
import {
  criarAssessor,
  listarAssessores,
  atualizarAssessor,
  inativarAssessor,
} from './services/assessores';
import { obterDashboard } from './services/dashboard';
import {
  listarAniversariantesCidadaos,
  listarAniversariantesAssessores,
} from './services/relatoriosAniversario';
import {
  exportarCsv,
  exportarExcel,
  exportarPdf,
  DadosRelatorio,
} from './services/relatorios';
import {
  realizarBackup,
  precisaBackupDiarioAgora,
  marcarBackupDiarioFeito,
  obterConfigBackup,
  salvarConfigBackup,
} from './services/backup';

import {
  criarUsuarioGestao,
  listarUsuariosGestao,
  atualizarUsuarioGestao,
  resetarSenhaUsuario,
  inativarUsuarioGestao,
} from './services/usuarios';

import { resetarDadosSistema } from './services/reset';

import { garantirPastasBase, garantirBancoInicial } from './config/paths';

import { obterHistoricoCidadao } from "./services/historicoCidadao";



const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../out/index.html'));
  }
}

ipcMain.handle('auth:login', async (_event, nome: string, senha: string) => {
  try {
    const usuario = await autenticar(nome, senha);
    return { sucesso: true, usuario };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

//handle cidadaos

ipcMain.handle('cidadaos:listar', async (_event, filtros) => {
  try {
    const resultado = await listarCidadaos(filtros);
    return { sucesso: true, ...resultado };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle('cidadaos:criar', async (_event, dados, usuarioId: number) => {
  try {
    const cidadao = await criarCidadao(dados, usuarioId);
    return { sucesso: true, cidadao };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle(
  'cidadaos:atualizar',
  async (_event, id: number, dados, usuarioId: number) => {
    try {
      const cidadao = await atualizarCidadao(id, dados, usuarioId);
      return { sucesso: true, cidadao };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'cidadaos:inativar',
  async (_event, id: number, usuarioId: number) => {
    try {
      await inativarCidadao(id, usuarioId);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle("cidadaos:historico", async (_event, cidadaoId: number) => {
  try {
    const historico = await obterHistoricoCidadao(cidadaoId);
    return { sucesso: true, ...historico };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});




//handle atendimentos
ipcMain.handle('atendimentos:listar', async (_event, filtros) => {
  try {
    const resultado = await listarAtendimentos(filtros);
    return { sucesso: true, ...resultado };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle(
  'atendimentos:criar',
  async (_event, dados, usuarioId: number) => {
    try {
      const atendimento = await criarAtendimento(dados, usuarioId);
      return { sucesso: true, atendimento };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'atendimentos:atualizar',
  async (_event, id: number, dados, usuarioId: number) => {
    try {
      const atendimento = await atualizarAtendimento(id, dados, usuarioId);
      return { sucesso: true, atendimento };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'atendimentos:inativar',
  async (_event, id: number, usuarioId: number) => {
    try {
      await inativarAtendimento(id, usuarioId);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

//hadle demanda
ipcMain.handle('demandas:listar', async (_event, filtros) => {
  try {
    const resultado = await listarDemandas(filtros);
    return { sucesso: true, ...resultado };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle('demandas:criar', async (_event, dados, usuarioId: number) => {
  try {
    const demanda = await criarDemanda(dados, usuarioId);
    return { sucesso: true, demanda };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle(
  'demandas:atualizar',
  async (_event, id: number, dados, usuarioId: number) => {
    try {
      const demanda = await atualizarDemanda(id, dados, usuarioId);
      return { sucesso: true, demanda };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'demandas:inativar',
  async (_event, id: number, usuarioId: number) => {
    try {
      await inativarDemanda(id, usuarioId);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

//handle indicações e oficios
ipcMain.handle('indicacoesOficios:listar', async (_event, filtros) => {
  try {
    const resultado = await listarIndicacoesOficios(filtros);
    return { sucesso: true, ...resultado };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle(
  'indicacoesOficios:criar',
  async (_event, dados, usuarioId: number) => {
    try {
      const indicacaoOficio = await criarIndicacaoOficio(dados, usuarioId);
      return { sucesso: true, indicacaoOficio };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'indicacoesOficios:atualizar',
  async (_event, id: number, dados, usuarioId: number) => {
    try {
      const indicacaoOficio = await atualizarIndicacaoOficio(
        id,
        dados,
        usuarioId,
      );
      return { sucesso: true, indicacaoOficio };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'indicacoesOficios:inativar',
  async (_event, id: number, usuarioId: number) => {
    try {
      await inativarIndicacaoOficio(id, usuarioId);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

//handle comunidade
ipcMain.handle('comunidades:listar', async (_event, filtros) => {
  try {
    const resultado = await listarComunidades(filtros);
    return { sucesso: true, ...resultado };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle(
  'comunidades:criar',
  async (_event, dados, usuarioId: number) => {
    try {
      const comunidade = await criarComunidade(dados, usuarioId);
      return { sucesso: true, comunidade };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'comunidades:atualizar',
  async (_event, id: number, dados, usuarioId: number) => {
    try {
      const comunidade = await atualizarComunidade(id, dados, usuarioId);
      return { sucesso: true, comunidade };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'comunidades:inativar',
  async (_event, id: number, usuarioId: number) => {
    try {
      await inativarComunidade(id, usuarioId);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

//handle agenda

ipcMain.handle('agenda:listar', async (_event, filtros) => {
  try {
    const resultado = await listarAgenda(filtros);
    return { sucesso: true, ...resultado };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle('agenda:criar', async (_event, dados, usuarioId: number) => {
  try {
    const item = await criarAgenda(dados, usuarioId);
    return { sucesso: true, item };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle(
  'agenda:atualizar',
  async (_event, id: number, dados, usuarioId: number) => {
    try {
      const item = await atualizarAgenda(id, dados, usuarioId);
      return { sucesso: true, item };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'agenda:inativar',
  async (_event, id: number, usuarioId: number) => {
    try {
      await inativarAgenda(id, usuarioId);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

// handle dashboard

ipcMain.handle('dashboard:obter', async () => {
  try {
    const dados = await obterDashboard();
    return { sucesso: true, dados };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});
//handle assessores
ipcMain.handle('assessores:listar', async (_event, filtros) => {
  try {
    const resultado = await listarAssessores(filtros);
    return { sucesso: true, ...resultado };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle('assessores:criar', async (_event, dados, usuarioId: number) => {
  try {
    const assessor = await criarAssessor(dados, usuarioId);
    return { sucesso: true, assessor };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle(
  'assessores:atualizar',
  async (_event, id: number, dados, usuarioId: number) => {
    try {
      const assessor = await atualizarAssessor(id, dados, usuarioId);
      return { sucesso: true, assessor };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'assessores:inativar',
  async (_event, id: number, usuarioId: number) => {
    try {
      await inativarAssessor(id, usuarioId);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

//handle anexos
ipcMain.handle(
  'anexos:salvar',
  async (
    _event,
    tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
    entidadeId: number,
    arquivos,
  ) => {
    try {
      const anexos = await salvarAnexos(tipo, entidadeId, arquivos);
      return { sucesso: true, anexos };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'anexos:listar',
  async (
    _event,
    tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
    entidadeId: number,
  ) => {
    try {
      const anexos = await listarAnexos(tipo, entidadeId);
      return { sucesso: true, anexos };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'anexos:remover',
  async (
    _event,
    tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
    anexoId: number,
  ) => {
    try {
      await removerAnexo(tipo, anexoId);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'anexos:baixar',
  async (
    _event,
    tipo: 'atendimentos' | 'demandas' | 'indicacoesOficios',
    anexoId: number,
  ) => {
    try {
      const info = await caminhoAbsolutoAnexo(tipo, anexoId);
      if (!info) {
        return { sucesso: false, erro: 'Anexo não encontrado' };
      }

      const resultado = await dialog.showSaveDialog({
        defaultPath: info.nomeArquivo,
      });

      if (resultado.canceled || !resultado.filePath) {
        return { sucesso: true, cancelado: true };
      }

      fs.copyFileSync(info.caminho, resultado.filePath);
      return { sucesso: true, cancelado: false };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

//handle relatorios

ipcMain.handle(
  'relatorios:aniversariantesCidadaos',
  async (_event, mes: number) => {
    try {
      const itens = await listarAniversariantesCidadaos(mes);
      return { sucesso: true, itens };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'relatorios:aniversariantesAssessores',
  async (_event, mes: number) => {
    try {
      const itens = await listarAniversariantesAssessores(mes);
      return { sucesso: true, itens };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'relatorios:exportarCsv',
  async (_event, dados: DadosRelatorio) => {
    try {
      const resultado = await exportarCsv(dados);
      return { sucesso: true, ...resultado };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'relatorios:exportarExcel',
  async (_event, dados: DadosRelatorio) => {
    try {
      const resultado = await exportarExcel(dados);
      return { sucesso: true, ...resultado };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'relatorios:exportarPdf',
  async (_event, dados: DadosRelatorio) => {
    try {
      const resultado = await exportarPdf(dados);
      return { sucesso: true, ...resultado };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

//backup

ipcMain.handle('backup:obterConfig', async () => {
  try {
    const config = obterConfigBackup();
    return { sucesso: true, config };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle('backup:salvarConfig', async (_event, horarioDiario: string) => {
  try {
    const config = salvarConfigBackup({ horarioDiario });
    return { sucesso: true, config };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle('backup:executarAgora', async () => {
  try {
    const resultado = await realizarBackup();
    return { sucesso: true, caminho: resultado.caminho };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

function iniciarAgendamentoBackup() {
  setInterval(async () => {
    if (precisaBackupDiarioAgora()) {
      try {
        await realizarBackup();
        marcarBackupDiarioFeito();
      } catch (erro) {
        console.error('Falha no backup diário agendado:', erro);
      }
    }
  }, 60_000);
}

ipcMain.handle('usuariosGestao:listar', async () => {
  try {
    const usuarios = await listarUsuariosGestao();
    return { sucesso: true, usuarios };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle('usuariosGestao:criar', async (_event, dados) => {
  try {
    const usuario = await criarUsuarioGestao(dados);
    return { sucesso: true, usuario };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

ipcMain.handle(
  'usuariosGestao:atualizar',
  async (_event, id: number, dados) => {
    try {
      const usuario = await atualizarUsuarioGestao(id, dados);
      return { sucesso: true, usuario };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

ipcMain.handle(
  'usuariosGestao:resetarSenha',
  async (_event, id: number, novaSenha: string) => {
    try {
      await resetarSenhaUsuario(id, novaSenha);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: (erro as Error).message };
    }
  },
);

//handle usuario

ipcMain.handle('usuariosGestao:inativar', async (_event, id: number) => {
  try {
    await inativarUsuarioGestao(id);
    return { sucesso: true };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

//handle reset
ipcMain.handle('sistema:resetarDados', async () => {
  try {
    const resultado = await resetarDadosSistema();
    return { sucesso: true, ...resultado };
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});

app.whenReady().then(() => {
  garantirPastasBase();
  garantirBancoInicial();
  createWindow();
  iniciarAgendamentoBackup();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
