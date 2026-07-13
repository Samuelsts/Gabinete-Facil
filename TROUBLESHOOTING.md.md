# Guia Rápido — Problemas Comuns ao Reinstalar/Reconfigurar

Este documento cobre os erros mais prováveis ao (a) reinstalar o ambiente de desenvolvimento do zero numa máquina nova, ou (b) rodar o instalador `.exe` gerado em outra máquina. Não repete a explicação técnica completa (isso está no `AGENTS.md`) — é um guia direto de "vi esse erro, faço isso".

---

## Parte 1 — Reinstalando o AMBIENTE DE DESENVOLVIMENTO numa máquina nova

### Passo a passo esperado
```bash
git clone <repositorio>
cd gabinete-facil
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Erro: `Cannot find module '.prisma/client/default'`
**Causa:** `npx prisma generate` não rodou, ou rodou antes de `npm install` terminar.
**Solução:**
```bash
npx prisma generate
```

### Erro: `Unable to open the database file`
**Causa:** o arquivo `prisma/dev.db` não existe ainda (primeira vez) ou o caminho está incorreto.
**Solução:**
```bash
npx prisma migrate dev
```
Isso cria o banco do zero, aplicando todas as migrations.

### Erro: `npx prisma db seed` fica em silêncio, sem criar nada
**Causa:** a chave `"prisma": { "seed": "..." }` no `package.json` precisa estar no **nível raiz** do JSON, não dentro de `"scripts"`. Confirme a estrutura:
```json
{
  "scripts": { ... },
  "prisma": { "seed": "ts-node --project prisma/tsconfig.seed.json prisma/seed.ts" }
}
```

### Erro: `npm run electron:build` reclama de `archiver`, `pdfkit` ou `exceljs`
**Causa:** versão errada instalada, ou `node_modules` corrompido.
**Solução:**
```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

### App abre sem estilo nenhum (visual "cru", tipo HTML puro)
**Causa:** rodando com `NODE_ENV=production` setado no terminal por engano durante o `npm run dev` (isso quebra o hot-reload do Next). Feche o terminal e abra um novo.
**Verificação:**
```bash
echo %NODE_ENV%
```
Se retornar `production`, feche o terminal, abra um novo, e rode `npm run dev` de novo.

---

## Parte 2 — Instalando o `.exe` em OUTRA MÁQUINA (usuário final)

### Passo a passo esperado
1. Copiar só o arquivo `Gabinete Fácil Setup x.x.x.exe`.
2. Rodar o instalador — não exige permissão de administrador.
3. Abrir pelo atalho criado.
4. Login com `Administrador` / `admin123` (trocar depois em Usuários → Resetar senha).

### Windows SmartScreen bloqueia ("Windows protegeu seu PC")
**Causa:** o instalador não é assinado digitalmente (normal para uso interno, sem certificado de editora).
**Solução:** clicar em "Mais informações" → "Executar assim mesmo".

### Erro `Cannot find module '.prisma/client/default'` (só nesse app instalado, nunca em dev)
**Causa:** o instalador foi gerado sem a correção de `extraResources` para a pasta `.prisma` (ver `AGENTS.md`, seção 6, item 6). Isso indica que o `.exe` distribuído foi gerado de uma versão antiga do `package.json`, antes dessa correção.
**Solução:** gerar o instalador de novo a partir do código atual:
```bash
npm run gerar-template-db
set SEED_DB_PATH=resources/gabinete-template.db && npx prisma db seed
npm run dist
```
Distribuir o novo `.exe` gerado em `dist/`.

### Login falha com "Credenciais inválidas" mesmo com usuário/senha corretos, na primeira execução
**Causa:** o banco não foi copiado para `%ProgramData%\GabineteFacil\` (template ausente ou corrompido no instalador).
**Verificação:**
```bash
dir "%ProgramData%\GabineteFacil"
```
Se `gabinete.db` tiver 0 bytes ou não existir, o template não foi copiado.
**Solução:** desinstalar o app, apagar a pasta `%ProgramData%\GabineteFacil` manualmente, reinstalar. Se persistir, o instalador foi gerado sem o `resources/gabinete-template.db` populado — regerar conforme o passo acima.

### Texto ilegível em algum modal/tela (cor muito escura sobre fundo escuro)
**Causa:** dependência do tema claro/escuro do Windows daquela máquina (bug já corrigido no código-fonte — ver `AGENTS.md`, seção 6, item 8). Só acontece se o `.exe` instalado for de uma versão anterior a essa correção.
**Solução:** gerar e distribuir um `.exe` atualizado (`npm run dist`).

### Quero trocar o horário do backup automático ou fazer backup manual
**Onde:** dentro do app, menu **Configurações** (visível para qualquer perfil).

### Preciso resetar todos os dados do sistema (recomeçar do zero)
**Onde:** dentro do app, menu **Usuários** — botão "Resetar sistema", visível **somente** para a conta padrão "Administrador" (não qualquer usuário com esse perfil). Um backup automático é gerado antes da limpeza, em `%ProgramData%\GabineteFacil\backups\`.

---

## Onde ficam os dados (para qualquer diagnóstico manual)

| Item | Caminho |
|---|---|
| Banco de dados | `%ProgramData%\GabineteFacil\gabinete.db` |
| Anexos | `%ProgramData%\GabineteFacil\uploads\` |
| Backups | `%ProgramData%\GabineteFacil\backups\` |
| Configurações (horário de backup) | `%ProgramData%\GabineteFacil\config\` |
| Executável | `%LOCALAPPDATA%\Programs\gabinete-facil\` |

Para inspecionar o banco manualmente em qualquer máquina (requer Node/npm instalados):
```bash
npx prisma studio
```
