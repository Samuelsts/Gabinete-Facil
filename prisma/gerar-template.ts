// Script de build (não faz parte do app em runtime): gera um banco
// SQLite limpo, já migrado e com os usuários/assessor padrão do seed,
// para ser embutido no instalador. Rodado manualmente antes de cada
// build de produção, nunca pelo usuário final.
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CAMINHO_TEMPLATE = path.join(
  __dirname,
  '..',
  'resources',
  'gabinete-template.db',
);

// Remove template anterior, se existir, para garantir que o novo
// reflita exatamente o schema atual (evita ficar com um template
// desatualizado de um build anterior).
if (fs.existsSync(CAMINHO_TEMPLATE)) {
  fs.unlinkSync(CAMINHO_TEMPLATE);
}

fs.mkdirSync(path.dirname(CAMINHO_TEMPLATE), { recursive: true });

// Aplica todas as migrations num banco novo, no caminho de destino
// final — migrate deploy (não "dev") é o comando correto para aplicar
// migrations sem interatividade, sem gerar migration nova.
execSync(`npx prisma migrate deploy --schema=prisma/schema.prisma`, {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: `file:${CAMINHO_TEMPLATE}` },
});

console.log(`Template de banco gerado em: ${CAMINHO_TEMPLATE}`);
console.log('Rode o seed a seguir para popular os usuários/assessor padrão.');
