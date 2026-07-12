import fs from "fs";
import path from "path";
// eslint-disable-next-line
const archiverModulo: any = require("archiver");
const archiver = archiverModulo.default ?? archiverModulo;

import {
  caminhoBanco,
  pastaUploads,
  pastaConfig,
  pastaBackups,
} from "../config/paths";

function caminhoConfigBackup(): string {
  return path.join(pastaConfig(), "backup-config.json");
}

interface ConfigBackup {
  horarioDiario: string;
  ultimoBackupData: string | null;
}

const CONFIG_PADRAO: ConfigBackup = {
  horarioDiario: "18:00",
  ultimoBackupData: null,
};

export function obterConfigBackup(): ConfigBackup {
  const caminho = caminhoConfigBackup();
  if (!fs.existsSync(caminho)) return CONFIG_PADRAO;

  try {
    const conteudo = fs.readFileSync(caminho, "utf-8");
    return { ...CONFIG_PADRAO, ...JSON.parse(conteudo) };
  } catch {
    return CONFIG_PADRAO;
  }
}

export function salvarConfigBackup(config: Partial<ConfigBackup>) {
  const atual = obterConfigBackup();
  const novo = { ...atual, ...config };
  fs.mkdirSync(pastaConfig(), { recursive: true });
  fs.writeFileSync(caminhoConfigBackup(), JSON.stringify(novo, null, 2));
  return novo;
}

function nomeArquivoBackup(): string {
  const agora = new Date();
  const data = agora.toISOString().slice(0, 10);
  const hora = String(agora.getHours()).padStart(2, "0");
  const minuto = String(agora.getMinutes()).padStart(2, "0");
  return `Backup_${data}_${hora}${minuto}.zip`;
}

export async function realizarBackup(): Promise<{ caminho: string }> {
  const pastaDestino = pastaBackups();
  fs.mkdirSync(pastaDestino, { recursive: true });

  const caminhoZip = path.join(pastaDestino, nomeArquivoBackup());

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(caminhoZip);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve({ caminho: caminhoZip }));
    archive.on("error", reject);

    archive.pipe(output);

    const db = caminhoBanco();
    if (fs.existsSync(db)) {
      archive.file(db, { name: "gabinete.db" });
    }

    if (fs.existsSync(pastaUploads())) {
      archive.directory(pastaUploads(), "uploads");
    }
    if (fs.existsSync(pastaConfig())) {
      archive.directory(pastaConfig(), "config");
    }

    archive.finalize();
  });
}

export function marcarBackupDiarioFeito() {
  const hoje = new Date().toISOString().slice(0, 10);
  salvarConfigBackup({ ultimoBackupData: hoje });
}

export function precisaBackupDiarioAgora(): boolean {
  const config = obterConfigBackup();
  const agora = new Date();
  const horarioAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(
    agora.getMinutes()
  ).padStart(2, "0")}`;
  const hoje = agora.toISOString().slice(0, 10);

  return horarioAtual === config.horarioDiario && config.ultimoBackupData !== hoje;
}