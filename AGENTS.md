<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CONTEXTO DE PROJETO — Gabinete Fácil
> Documento voltado para consumo por assistentes de IA (Claude, GPT, etc.) que venham a continuar o desenvolvimento deste projeto. Contém arquitetura, convenções, padrões obrigatórios, armadilhas já resolvidas e estado atual. Leia por completo antes de propor qualquer alteração.

---

## 1. IDENTIDADE DO PROJETO

- **Nome:** Gabinete Fácil
- **Tipo:** Aplicativo desktop Windows (10/11), 100% offline, sem servidor externo
- **Domínio:** Gestão administrativa de gabinete parlamentar (vereador)
- **Usuários:** 1 a ~10 pessoas por instalação, uso local em rede interna do gabinete
- **Idioma:** Todo código (nomes de variáveis, funções, campos de banco, mensagens de erro, UI) é em **português**. Não traduza para inglês em contribuições futuras — mantenha consistência.
- **Filosofia de projeto:** simplicidade e estabilidade acima de sofisticação técnica. Evitar bibliotecas pesadas, arquiteturas em camadas excessivas, otimização prematura. Preferir a solução mais direta que resolve o problema com robustez suficiente para o volume de dados esperado (uso local de um gabinete, não SaaS multi-tenant).

---

## 2. STACK TÉCNICA (versões fixadas — não atualizar sem motivo forte)

| Item | Versão/escolha | Motivo de fixação |
|---|---|---|
| Node.js | 22 LTS | — |
| Next.js | 16.2.x, App Router | `output: "export"` (estático, sem servidor) |
| React | 19.x | — |
| Electron | ^43 | — |
| TypeScript | ^5 | `module: esnext`, `moduleResolution: bundler` no tsconfig principal |
| **Prisma** | **6.19.3, fixado com `--save-exact`** | **Prisma 7 introduziu breaking changes (client output customizado, `prisma.config.ts`) que quebraram o fluxo. NÃO atualizar para v7 sem reavaliar toda a cadeia de geração de cliente.** |
| bcryptjs (não `bcrypt`) | ^3 | Evita toolchain de compilação nativa (node-gyp), simplifica build multiplataforma |
| SQLite | via Prisma | Banco único em arquivo |
| Tailwind CSS | ^4 | Único sistema de estilo; sem CSS-in-JS |
| esbuild | ^0.28 | Bundler do processo Electron (main + preload) |
| pdfkit, exceljs, archiver | — | Geração de relatórios e backup; todos marcados `--external` no esbuild (ver seção 6) |
| electron-builder | ^26 | Empacotamento do instalador; **asar DESATIVADO** (ver seção 6) |

---

## 3. ARQUITETURA — REGRA FUNDAMENTAL

**O processo de renderização (React) NUNCA acessa o banco de dados, o sistema de arquivos ou qualquer API do Node diretamente.**

```
Componente React
  → src/modules/{modulo}/services/*.ts   (chama window.electronAPI.xxx)
  → electron/preload.ts                   (contextBridge, ponte segura)
  → electron/main.ts                      (ipcMain.handle, um por operação)
  → electron/services/{modulo}.ts         (lógica de negócio + Prisma)
  → SQLite
```

Configuração de segurança do BrowserWindow (não alterar):
```typescript
webPreferences: {
  preload: path.join(__dirname, "preload.js"),
  contextIsolation: true,
  nodeIntegration: false,
}
```

Todo canal IPC segue o padrão de retorno:
```typescript
{ sucesso: true, ...dados } | { sucesso: false, erro: string }
```
Os services do frontend (`src/modules/*/services/*.ts`) sempre fazem o unwrap: checam `res.sucesso`, lançam `Error` com `res.erro` se falhar, senão retornam o dado já tipado. Componentes React nunca chamam `window.electronAPI` diretamente — sempre passam pelo service do módulo.

---

## 4. ESTRUTURA DE PASTAS

```
gabinete-facil/
├── electron/
│   ├── main.ts                # Registra TODOS os ipcMain.handle(); cria a janela
│   ├── preload.ts              # contextBridge.exposeInMainWorld("electronAPI", {...})
│   ├── db.ts                    # export const prisma = new PrismaClient({ datasourceUrl: ... })
│   ├── config/
│   │   └── paths.ts              # ÚNICA fonte de verdade para caminhos (banco, uploads, backups, config)
│   └── services/                  # Um arquivo por módulo de negócio; só aqui o Prisma é usado
│       ├── auth.ts, usuarios.ts, assessores.ts, cidadaos.ts,
│       ├── atendimentos.ts, demandas.ts, indicacoesOficios.ts,
│       ├── comunidades.ts, agenda.ts, dashboard.ts,
│       ├── anexos.ts             # GENERALIZADO: serve atendimentos/demandas/indicacoesOficios
│       ├── relatorios.ts          # Exportação genérica CSV/Excel/PDF (recebe {titulo, colunas, linhas})
│       ├── relatoriosAniversario.ts
│       ├── backup.ts, reset.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts                    # Cria 3 usuários + 1 assessor padrão (idempotente)
│   ├── tsconfig.seed.json         # tsconfig separado (CommonJS) só para rodar seed.ts via ts-node
│   └── gerar-template.ts          # Gera resources/gabinete-template.db para o instalador
├── src/
│   ├── app/
│   │   ├── page.tsx                # Componente Home: login + roteamento manual por estado (sem next/navigation)
│   │   ├── layout.tsx               # Fonte Fraunces (título), SessaoProvider
│   │   └── globals.css               # Animações da tela de login; --foreground/--background FIXOS (sem media query de tema do SO)
│   ├── components/
│   │   ├── layout/ (Header, Sidebar, AppLayout)
│   │   ├── FormModal/FormModal.tsx     # Modal genérico reaproveitado por TODOS os módulos
│   │   └── Pagination/Pagination.tsx    # Componente genérico de paginação (Anterior/Próxima)
│   ├── contexts/SessaoContext.tsx       # Usuário logado em memória (sem persistência entre aberturas)
│   ├── hooks/usePermissao.ts             # podeCriar/podeEditar/podeExcluir por perfil
│   ├── modules/{modulo}/
│   │   ├── components/{Modulo}Page.tsx      # Listagem + filtros + paginação
│   │   ├── components/{Modulo}FormModal.tsx  # Criar/editar
│   │   └── services/{modulo}Service.ts        # Unwrap do IPC
│   └── types/electron.d.ts                # ÚNICA fonte de tipos do contrato IPC (Window.electronAPI)
├── resources/gabinete-template.db          # Gerado, NÃO versionado — banco pré-migrado para o instalador
└── out/, dist/, dist-electron/              # Gerados, não versionados
```

---

## 5. PADRÕES OBRIGATÓRIOS (replicar exatamente ao criar novo módulo)

### 5.1 Schema Prisma por módulo
- Campos de auditoria padrão: `criadoPorId Int?`, `atualizadoPorId Int?`, `createdAt`, `updatedAt`, `ativo Boolean @default(true)`.
- Nunca excluir fisicamente entidades de negócio — sempre soft delete (`ativo: false`).
- Enum de status próprio por módulo (não compartilhar enum entre módulos, mesmo com valores idênticos) — preserva independência entre módulos.
- Campo `responsavelAssessorId` (FK para `Assessor`, não `Usuario`) em módulos que têm responsável — `Usuario` é login, `Assessor` é pessoa de campo, propositalmente desacoplados.

### 5.2 Service backend (`electron/services/{modulo}.ts`)
Funções padrão: `criar{Entidade}`, `listar{Entidades}` (com filtros + paginação via `skip`/`take` do Prisma, retorna `{ itens, total, pagina, totalPaginas }`), `atualizar{Entidade}`, `inativar{Entidade}`.
Se houver campo de conclusão condicional (status "CONCLUIDO" exige data), validar com uma função `resolverDataConclusao()` que lança erro se faltar.

### 5.3 IPC (`electron/main.ts`)
```typescript
ipcMain.handle("{modulo}:{acao}", async (_event, ...args) => {
  try {
    const resultado = await funcaoDoService(...args);
    return { sucesso: true, ...resultado }; // ou { sucesso: true, chave: resultado }
  } catch (erro) {
    return { sucesso: false, erro: (erro as Error).message };
  }
});
```

### 5.4 Preload
Cada função IPC precisa de uma entrada correspondente em `electron/preload.ts` — **é a causa mais comum de bugs "function is not a function"**: implementar o handler no `main.ts` mas esquecer de expor no `preload.ts` (ou vice-versa). Sempre verificar os dois lados.

### 5.5 Tipos (`src/types/electron.d.ts`)
Toda função de `window.electronAPI` precisa estar tipada aqui, incluindo o retorno exato. Tipo genérico reaproveitável para listagens paginadas:
```typescript
export interface ResultadoPaginado<T> { itens: T[]; total: number; pagina: number; totalPaginas: number; }
export type RespostaListagem<T> = ({ sucesso: true } & ResultadoPaginado<T>) | { sucesso: false; erro: string };
```

### 5.6 Tela de listagem (padrão React)
- Estado de filtros individuais (`useState` por campo), não um objeto único.
- **Reset de página ao mudar filtro**: NÃO usar `useEffect` para isso (dispara lint `react-hooks/set-state-in-effect`). Usar o padrão "ajuste de estado durante a renderização":
```tsx
const filtrosAtuais = `${busca}|${filtroStatus}|...`;
const [filtrosAnteriores, setFiltrosAnteriores] = useState(filtrosAtuais);
if (filtrosAtuais !== filtrosAnteriores) {
  setFiltrosAnteriores(filtrosAtuais);
  setPagina(1);
}
```
- Busca de dados em `useEffect` com flag `ignore` para evitar race condition, nunca extraindo a função de fetch para fora do efeito (mesmo motivo do lint acima).
- Botões de ação (Criar/Editar/Excluir) condicionados a `usePermissao()`.

### 5.7 Modal de criar/editar
- Sempre usa `FormModal` genérico (`src/components/FormModal/FormModal.tsx`).
- Componente recebe `key={item ? item.id : "novo"}` no componente pai — força **remontagem completa** ao trocar de alvo de edição, em vez de `useEffect` para resetar campos (mesmo motivo de lint da seção 5.6). Estados inicializados direto de `item?.campo ?? valorPadrao`.
- Datas: sempre normalizar `Date | string | null` para `"YYYY-MM-DD"` (formato de `<input type="date">`) com uma função utilitária local `paraInputDate()`. Ao salvar, o backend converte a string de volta para `Date` antes de gravar no Prisma.

### 5.8 Anexos
Se o módulo precisar de upload de arquivo, reaproveitar `electron/services/anexos.ts` (já generalizado por `tipo: "atendimentos" | "demandas" | "indicacoesOficios" | ...`). Para adicionar um novo tipo de entidade com anexo: estender a union type nesse arquivo, no `main.ts`, no `preload.ts` e em `electron.d.ts` (4 lugares).

### 5.9 Relatórios
Cada relatório é uma tela separada em `src/modules/relatorios/components/Relatorio{Modulo}.tsx`, reaproveitando o mesmo service de listagem do módulo (com `tamanhoPagina: 10000` para trazer tudo, sem paginação real na tela de relatório) e o componente `<ExportButtons gerarDados={...} />`. A função `gerarDados()` monta `{ titulo, colunas, linhas }` (linhas já formatadas como texto) só no momento do clique de exportar, nunca antes.

---

## 6. ARMADILHAS JÁ RESOLVIDAS (não repetir o erro)

1. **esbuild + Prisma Client**: o Prisma Client carrega o motor nativo via `require('.prisma/client/default')` com caminho relativo a `__dirname` do próprio pacote. Se o esbuild empacotar isso, o `__dirname` muda e quebra. Solução: `--external:@prisma/client --external:.prisma/client` no comando esbuild (script `electron:build` do `package.json`). Mesmo tratamento aplicado a `pdfkit`, `exceljs`, `archiver`.

2. **Resolução de `__dirname` em dev**: como o esbuild empacota tudo em um único `dist-electron/main.js` (não preserva subpastas como `dist-electron/config/paths.js`), qualquer `__dirname` dentro de código importado por `main.ts` resolve para `dist-electron/`, não para a pasta original do `.ts`. Em `electron/config/paths.ts`, o cálculo de pasta de dados em dev é `path.join(__dirname, "..")` (um único `..`), não dois.

3. **Prisma v7 é incompatível com o fluxo atual**: já foi tentado e revertido. v7 exige `prisma.config.ts` e client output customizado. Manter fixado em 6.19.3.

4. **`archiver` — versão desatualizada instalada por engano** causou `archiver is not a function` (a v3.x antiga expõe `{ Archiver, ZipArchive, ... }` em vez da função direta). Fixado em `archiver@7` com `--save-exact`. Import correto: `const archiver = require("archiver")` com `// eslint-disable-next-line` (a sintaxe `import x = require()` não é aceita com `module: esnext` no tsconfig deste projeto).

5. **`asar: false` obrigatório no electron-builder**: com asar ativado, o motor nativo do Prisma dentro do pacote `.asar` não é localizável em runtime, mesmo com `asarUnpack` configurado — testado e não resolveu. A saída que funcionou foi desativar asar completamente (`"asar": false` no `package.json`, seção `"build"`).

6. **Pasta `.prisma` (com ponto) é ignorada pelo glob do electron-builder** mesmo com `"node_modules/.prisma/**/*"` explícito em `"files"`. Solução definitiva: copiar via `"extraResources"`:
```json
{ "from": "node_modules/.prisma", "to": "app/node_modules/.prisma" }
```

7. **`assetPrefix` do Next.js**: em produção (carregado via `file://` pelo Electron) precisa ser `"./"` (caminho relativo), senão CSS/JS não carregam (ficam `/​_next/...`, absoluto, que não resolve em `file://`). Em desenvolvimento, precisa ser `undefined` — caso contrário quebra o hot-reload (HMR), obrigando reload manual e deixando o bundle inconsistente (sintoma observado: botões param de funcionar). Configuração correta:
```typescript
const isDev = process.env.NODE_ENV === "development";
assetPrefix: isDev ? undefined : "./"
```

8. **Cor de texto dependente do tema do SO**: o `globals.css` padrão do `create-next-app` usa `@media (prefers-color-scheme: dark)` para trocar `--foreground`. Como este app tem tema escuro fixo por design, isso causava texto ilegível em máquinas com Windows no modo claro. Removido — `:root` fixa `--background`/`--foreground` sempre no valor escuro, sem media query condicional.

9. **Banco de produção**: o instalador não pode rodar `prisma migrate dev` (ferramenta de dev). Fluxo: `npm run gerar-template-db` aplica migrations num banco novo em `resources/gabinete-template.db` (via `prisma migrate deploy`), depois roda `seed.ts` apontando pra esse arquivo (`SEED_DB_PATH` env var). Esse `.db` é embutido via `extraResources` e copiado para `%ProgramData%\GabineteFacil\gabinete.db` na primeira execução (`garantirBancoInicial()` em `paths.ts`, chamado antes de `createWindow()`), só se o banco ainda não existir lá. **Atenção**: `process.resourcesPath` só aponta para a pasta de resources correta quando o app está empacotado de verdade — testar isso via `npx electron .` direto (sem empacotar) não valida esse fluxo.

10. **Migration com FK obrigatória em tabela já populada**: ao trocar `responsavelUsuarioId` → `responsavelAssessorId` (refactor de desacoplamento Usuario/Assessor), foi necessário limpar registros de teste antes de rodar a migration, pois a nova coluna `NOT NULL` não teria valor para linhas existentes.

---

## 7. MODELO DE DADOS (resumo)

Entidades: `Usuario`, `Assessor`, `Cidadao`, `Atendimento` (+`AtendimentoAnexo`), `Demanda` (+`DemandaAnexo`, campo `prioridade`), `IndicacaoOficio` (+`IndicacaoOficioAnexo`, campo `tipo`: INDICACAO/OFICIO, sem cidadão), `Comunidade` (sem anexo, campo `liderComunidade`), `Agenda` (sem cidadão nem assessor, campo `acaoCompromisso` obrigatório).

Perfis de `Usuario`: `ADMINISTRADOR`, `EDITOR`, `VISUALIZADOR` (enum `Perfil`). Campo `usuarioPadrao: Boolean` protege os 3 usuários do seed contra edição de nome/perfil (só inativação permitida). Login por `nome` (`@unique`), não `email` (campo mantido como opcional, não usado no login).

`Assessor` tem campo espelho `assessorPadrao: Boolean` com a mesma proteção, para o assessor "Administrador" do seed.

---

## 8. COMANDOS DE REFERÊNCIA

```bash
npm run dev                # Desenvolvimento completo (Next dev + Electron)
npm run build:next         # Exporta Next.js estático (out/)
npm run electron:build     # Compila processo Electron (dist-electron/)
npm run gerar-template-db  # Gera banco template para produção
npm run dist                # Build completo + instalador (.exe em dist/)
npx prisma migrate dev --name <nome>   # Nova migration (dev)
npx prisma studio            # Interface visual do banco (dev)
npx prisma db seed            # Roda prisma/seed.ts contra o banco de dev
```

Ao gerar o template de produção, sempre nessa ordem:
```bash
npm run gerar-template-db
set SEED_DB_PATH=resources/gabinete-template.db && npx prisma db seed
```

---

## 9. ESTADO ATUAL DO PROJETO (o que está pronto)

Completo e testado: ambiente, autenticação (login por nome + perfis simples), 7 módulos de cadastro (Cidadãos, Assessores, Atendimentos, Demandas, Indicações/Ofícios, Comunidades, Agenda) todos com CRUD + filtros + paginação, anexos em 3 módulos, Dashboard, 9 relatórios com exportação CSV/Excel/PDF, backup agendado + manual, gestão de usuários com reset de sistema, identidade visual da tela de login, instalador Windows funcional (testado em máquina limpa/VM).

**Não implementado (fora de escopo por decisão explícita):** validação de permissão de perfil no backend (só frontend), paginação real com busca assíncrona nos seletores de relacionamento (usa limite alto de 10.000 em vez disso), assinatura de código do instalador.

---

## 10. AO CONTINUAR ESTE PROJETO

1. Leia este documento por completo antes de propor qualquer mudança estrutural.
2. Para novo módulo: siga exatamente os padrões da seção 5 — o objetivo é indistinguibilidade entre módulos, não criatividade de implementação.
3. Para bug de build/empacotamento: consulte a seção 6 antes de investigar do zero — é provável que já tenha sido enfrentado.
4. Nunca introduza acesso direto ao banco/filesystem a partir de componentes React — sempre pela cadeia IPC completa (seção 3).
5. Mantenha nomenclatura em português em todo o código novo, consistente com o existente.
