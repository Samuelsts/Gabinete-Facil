# Gabinete Fácil

Sistema desktop para gestão de gabinetes parlamentares — cadastro de cidadãos, atendimentos, demandas, indicações e ofícios, ações em comunidades, agenda, assessores, relatórios e backup automático.

Desenvolvido para funcionar **100% offline**, em Windows 10/11, com banco de dados local.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router, exportação estática) + React 19 |
| Desktop | Electron |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| Banco de dados | SQLite |
| ORM | Prisma |
| Relatórios | pdfkit (PDF), exceljs (Excel), CSV nativo |
| Backup | archiver (ZIP) |
| Empacotamento | electron-builder (instalador Windows via NSIS) |

## Funcionalidades

- **Autenticação** por usuário/senha, com 3 perfis de acesso (Administrador, Editor, Visualizador)
- **Cidadãos** — cadastro, edição, inativação, busca
- **Assessores** — cadastro independente de login, usado como responsável em outros módulos
- **Atendimentos**, **Demandas** (com prioridade), **Indicações e Ofícios**, **Comunidades**, **Agenda** — cada um com filtros, paginação e anexos (quando aplicável)
- **Dashboard** — totais, agenda do dia, aniversariantes do mês, atendimentos recentes
- **Relatórios** — um por módulo, reaproveitando os mesmos filtros das telas de listagem, com exportação em CSV, Excel e PDF
- **Backup** — agendado diariamente (se o app estiver aberto no horário configurado) e sob demanda, compactando banco, uploads e configurações em um `.zip`
- **Gestão de usuários** — restrita ao perfil Administrador, incluindo reset de senha e reset completo do sistema (com backup automático antes)

## Estrutura do projeto

```
gabinete-facil/
├── electron/           # Processo principal do Electron (IPC, services, banco)
│   ├── config/         # Caminhos centralizados de dados (dev/produção)
│   ├── services/        # Lógica de negócio por módulo
│   ├── main.ts
│   └── preload.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts          # Cria os 3 usuários e o assessor padrão
├── src/
│   ├── app/              # Páginas Next.js (App Router)
│   ├── components/       # Componentes reutilizáveis (modal, paginação, layout)
│   ├── contexts/         # Contexto de sessão (usuário logado)
│   ├── modules/           # Um subdiretório por módulo (components + services)
│   └── types/             # Tipos compartilhados entre React e Electron (IPC)
├── resources/             # Template de banco pré-migrado (gerado, não versionado)
└── dist/                   # Instalador gerado (não versionado)
```

## Pré-requisitos

- Node.js 22 LTS ou superior
- npm

## Instalação do ambiente de desenvolvimento

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

O `seed` cria três usuários padrão, todos com a senha `admin123`:

| Usuário | Perfil |
|---|---|
| Administrador | Acesso total |
| Editor | Pode criar e editar, não pode excluir |
| Visualizador | Somente leitura |

> Recomenda-se trocar essas senhas antes de usar o sistema em produção (Configurações de Usuários → Resetar senha).

## Rodando em desenvolvimento

```bash
npm run dev
```

Isso sobe o Next.js em modo dev (`localhost:3000`) e abre a janela do Electron apontando para ele, com hot-reload.

## Gerando o instalador de produção

O processo de build gera um pacote SQLite pré-migrado ("template"), que é embutido no instalador e copiado para a máquina do usuário na primeira execução.

**1. Gerar o template do banco** (só precisa ser refeito se o `schema.prisma` mudar):

```bash
npm run gerar-template-db
set SEED_DB_PATH=resources/gabinete-template.db && npx prisma db seed
```

**2. Gerar o instalador:**

```bash
npm run dist
```

O instalador (`Gabinete Fácil Setup x.x.x.exe`) é gerado em `dist/`. É o único arquivo necessário para distribuir e instalar em outra máquina.

### Onde ficam os dados em produção

| Item | Caminho |
|---|---|
| Executável | `%LOCALAPPDATA%\Programs\gabinete-facil\` (instalação por usuário, sem exigir administrador) |
| Banco, uploads, backups, config | `%ProgramData%\GabineteFacil\` |

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento completo (Next.js + Electron) |
| `npm run build:next` | Exporta o Next.js como arquivos estáticos (`out/`) |
| `npm run electron:build` | Compila o processo principal do Electron (`dist-electron/`) |
| `npm run dist` | Gera o instalador Windows completo |
| `npm run gerar-template-db` | Gera um banco SQLite migrado, usado como base do instalador |

## Backup

O sistema realiza backup automaticamente uma vez por dia, no horário configurado em **Configurações**, desde que o programa esteja aberto nesse momento. Também é possível gerar um backup manual a qualquer momento pelo mesmo menu. Os arquivos ficam em `%ProgramData%\GabineteFacil\backups\`.

## Licença

Uso interno — sem licença de distribuição pública definida.
