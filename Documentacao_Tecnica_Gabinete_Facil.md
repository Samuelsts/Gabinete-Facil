# Documentação Técnica — Gabinete Fácil

**Versão:** 1.0
**Tipo de sistema:** Aplicativo desktop offline para gestão de gabinete parlamentar
**Plataforma:** Windows 10/11

---

## 1. Visão Geral

O Gabinete Fácil é um sistema desktop desenvolvido para centralizar as atividades administrativas de um gabinete parlamentar: cadastro de cidadãos, atendimentos, demandas, indicações e ofícios, ações em comunidades, agenda, controle de assessores e usuários, relatórios gerenciais e backup automatizado.

O sistema roda **inteiramente offline**, sem dependência de internet ou servidor externo, com todos os dados armazenados localmente em banco SQLite.

### 1.1 Princípios de projeto

O desenvolvimento seguiu três diretrizes definidas desde o planejamento inicial:

- **Simplicidade sobre otimização prematura** — soluções foram escolhidas por robustez e facilidade de manutenção, não por sofisticação técnica.
- **Consistência de padrão entre módulos** — todo módulo de cadastro segue exatamente a mesma estrutura de tela (busca, filtros, tabela, paginação, modal de criar/editar), reduzindo a curva de aprendizado do usuário final.
- **Nenhum dado é apagado por padrão** — todos os cadastros usam inativação lógica (soft delete) em vez de exclusão física, preservando histórico.

---

## 2. Arquitetura Técnica

### 2.1 Stack

| Camada | Tecnologia | Papel |
|---|---|---|
| Interface | Next.js 16 (App Router) + React 19 | Renderização da UI, exportada como arquivos estáticos em produção |
| Desktop | Electron | Empacota a interface como aplicativo nativo Windows |
| Linguagem | TypeScript | Tipagem em todas as camadas (frontend, backend, contrato IPC) |
| Estilo | Tailwind CSS | Utilitários de estilo, sem CSS customizado além de animações pontuais |
| Banco de dados | SQLite | Armazenamento local em arquivo único |
| ORM | Prisma | Modelagem de schema, migrations e queries tipadas |
| Autenticação | bcryptjs | Hash de senha (nunca armazenada em texto puro) |
| Relatórios | pdfkit, exceljs | Geração de PDF e Excel |
| Backup | archiver | Compactação em ZIP |
| Empacotamento | electron-builder (NSIS) | Geração do instalador Windows |

### 2.2 Por que Next.js sem servidor em produção

Embora o Next.js seja tradicionalmente usado com um servidor Node rodando, este projeto usa `output: "export"`, gerando HTML/CSS/JS estáticos. A justificativa é arquitetural: o React nunca acessa o banco de dados diretamente — toda comunicação passa por IPC (Inter-Process Communication) do Electron. Isso elimina a necessidade de qualquer servidor rodando junto ao aplicativo, reduzindo consumo de memória e superfície de falha.

### 2.3 Fluxo de comunicação

```
Componente React (tela)
        │
        ▼
Service do módulo (src/modules/*/services/*.ts)
        │  window.electronAPI.xxx(...)
        ▼
Preload (electron/preload.ts) — ponte segura via contextBridge
        │  ipcRenderer.invoke(...)
        ▼
Processo principal (electron/main.ts) — ipcMain.handle(...)
        │
        ▼
Service do backend (electron/services/*.ts)
        │  Prisma Client
        ▼
SQLite (arquivo local)
```

Essa separação garante que o processo de renderização (`contextIsolation: true`, `nodeIntegration: false`) nunca tenha acesso direto ao sistema de arquivos ou ao banco — toda operação passa por um canal IPC explícito e tipado.

### 2.4 Gerenciamento de caminhos (dev vs. produção)

Um módulo central (`electron/config/paths.ts`) resolve todos os caminhos de dados (banco, uploads, backups, configurações) de forma condicional:

| Ambiente | Local dos dados |
|---|---|
| Desenvolvimento | Pasta do próprio projeto |
| Produção | `%ProgramData%\GabineteFacil\` |

Essa centralização evita duplicação de lógica de resolução de caminho, que originalmente estava espalhada em três arquivos diferentes (`db.ts`, `anexos.ts`, `backup.ts`) e foi consolidada em uma refatoração posterior.

---

## 3. Modelo de Dados

### 3.1 Entidades principais

| Entidade | Descrição |
|---|---|
| `Usuario` | Login do sistema. Três perfis fixos: Administrador, Editor, Visualizador. Login por nome de usuário (não e-mail). |
| `Assessor` | Cadastro de responsáveis de campo, independente de login — desacoplado propositalmente de `Usuario` |
| `Cidadao` | Cadastro da pessoa atendida pelo gabinete |
| `Atendimento` | Registro de atendimento a um cidadão, com status e anexos |
| `Demanda` | Similar a Atendimento, com campo adicional de prioridade (Baixa/Normal/Alta) |
| `IndicacaoOficio` | Registro de protocolo formal (Indicação ou Ofício), sem vínculo a cidadão |
| `Comunidade` | Ação em comunidade/bairro, vinculada a um assessor responsável |
| `Agenda` | Compromissos e ações agendadas, sem vínculo a cidadão ou assessor |
| `*Anexo` | Tabelas de anexo (Atendimento, Demanda, IndicacaoOficio), com arquivo físico em disco e metadados no banco |

### 3.2 Decisões de modelagem relevantes

- **Auditoria padrão:** todas as entidades de negócio possuem `criadoPorId`, `atualizadoPorId`, `createdAt`, `updatedAt` e `ativo` (soft delete).
- **Separação Usuario × Assessor:** usuários fazem login no sistema; assessores são pessoas de campo referenciadas como responsáveis, sem necessidade de credenciais. Essa separação foi introduzida via refatoração após a constatação de que nem todo assessor de campo precisa (ou deveria) ter acesso ao sistema.
- **Enums próprios por módulo:** `StatusAtendimento`, `StatusDemanda`, `StatusComunidade` e `StatusAgenda` são enums separados (mesmo com valores idênticos), preservando a independência entre módulos definida na arquitetura original — uma mudança de regra em um módulo não afeta os demais.
- **Anexos armazenados em disco, não no banco:** o banco guarda apenas metadados (nome, caminho relativo, tipo, tamanho); o arquivo físico fica em `uploads/{módulo}/{id}/`.

### 3.3 Usuários e assessores padrão do sistema

Toda instalação nova é populada com três usuários (perfis Administrador, Editor e Visualizador) e um assessor padrão, todos marcados com uma flag de proteção (`usuarioPadrao` / `assessorPadrao`) que impede edição de nome/perfil — apenas inativação é permitida. Essa proteção garante que o sistema sempre tenha pelo menos um caminho de acesso válido.

---

## 4. Módulos Funcionais

Cada módulo de cadastro segue o mesmo padrão de tela: barra de busca, filtros específicos do domínio, tabela paginada (20 itens por página, paginação resolvida no servidor via Prisma), modal único reaproveitado para criação e edição, e confirmação antes de inativar.

| Módulo | Filtros disponíveis | Anexos | Particularidade |
|---|---|---|---|
| Cidadãos | Nome | Não | Nome, celular e data de nascimento obrigatórios |
| Assessores | Nome | Não | Estrutura idêntica a Cidadãos, sem login |
| Atendimentos | Cidadão, status, assessor, período | Sim | — |
| Demandas | Cidadão, status, prioridade, assessor, período | Sim | Prioridade nasce "Normal", editável no cadastro |
| Indicações e Ofícios | Tipo, status, assessor, período | Sim | Sem vínculo a cidadão; possui número de protocolo livre |
| Comunidades | Bairro/nome, status, assessor, período | Não | Bairro obrigatório; nome opcional |
| Agenda | Ação/nome/bairro, status, período | Não | Sem vínculo a cidadão ou assessor; ordenação cronológica ascendente |

### 4.1 Regra de conclusão com data

Em todos os módulos com campo de status (Atendimentos, Demandas, Indicações/Ofícios, Comunidades, Agenda), a transição para "Concluído" exige uma data de conclusão — validada tanto na interface quanto na camada de serviço do backend, evitando que a regra seja contornada por qualquer caminho de chamada futuro.

### 4.2 Anexos

Suporte a múltiplos arquivos por registro (imagens, vídeos, documentos), com:
- Limite de 25MB por arquivo
- Download via diálogo nativo do Windows ("Salvar como")
- Armazenamento em `uploads/{módulo}/{id}/`, organizados por entidade

A lógica de manipulação de arquivo (salvar, listar, remover, baixar) foi generalizada em um único serviço (`electron/services/anexos.ts`), reaproveitado pelos três módulos que possuem anexos, evitando triplicar a implementação.

---

## 5. Autenticação e Controle de Acesso

### 5.1 Login

Autenticação por **nome de usuário e senha** (não e-mail), com senha armazenada como hash bcrypt (nunca em texto puro). Sessão mantida em memória durante a execução do aplicativo — não persiste entre reinicializações, exigindo login a cada abertura.

### 5.2 Perfis de acesso

| Perfil | Criar | Editar | Excluir/Inativar |
|---|---|---|---|
| Administrador | Sim | Sim | Sim |
| Editor | Sim | Sim | Não |
| Visualizador | Não | Não | Não |

A restrição é aplicada na interface (botões de ação ocultos conforme o perfil do usuário logado), centralizada em um hook único (`usePermissao`) para manter a regra em um só lugar. Por decisão explícita de escopo, a validação não é duplicada no backend — trade-off aceitável dado o uso interno e de baixo número de usuários do sistema.

### 5.3 Gestão de usuários

Módulo restrito exclusivamente ao perfil Administrador, permitindo:
- Criação de novos usuários (nome, senha definida pelo administrador, perfil)
- Edição de usuários personalizados (os três usuários padrão do sistema só podem ser inativados)
- Reset de senha de qualquer usuário
- **Reset completo do sistema** — apaga todos os dados operacionais (cidadãos, atendimentos, demandas, etc.), preservando usuários e assessor padrão. Disponível apenas para a conta padrão "Administrador" (não qualquer usuário com esse perfil), com backup automático de segurança executado antes da limpeza e dupla confirmação (incluindo digitação de uma palavra-chave) antes da execução.

---

## 6. Dashboard

Tela inicial após o login, exibindo:
- Totais de cidadãos, atendimentos e demandas abertas
- Agenda do dia
- Próximos compromissos (5 itens)
- Aniversariantes do mês (cidadãos)
- Atendimentos recentes (5 itens)

Todas as consultas são executadas em paralelo (`Promise.all`) para reduzir o tempo de carregamento da tela.

---

## 7. Relatórios

Nove relatórios ao todo: um por módulo operacional (Cidadãos, Assessores, Atendimentos, Demandas, Indicações/Ofícios, Comunidades, Agenda) mais dois relatórios especiais (Aniversariantes de Cidadãos e Aniversariantes de Assessores, com filtro por mês).

Cada relatório reaproveita exatamente os mesmos filtros e serviços de consulta já usados nas telas de listagem, garantindo que a lógica de filtragem exista em um único lugar por módulo. A exportação é feita através de um serviço genérico (`electron/services/relatorios.ts`) que recebe apenas colunas e linhas já formatadas como texto, e gera o arquivo em três formatos:

- **CSV** — com BOM UTF-8 para compatibilidade de acentuação no Excel
- **Excel** — via exceljs, com cabeçalho em negrito
- **PDF** — via pdfkit, em orientação paisagem com paginação automática

---

## 8. Backup

### 8.1 Comportamento

- **Backup diário agendado:** verificação a cada 60 segundos comparando o horário atual com um horário configurável pelo usuário; executa no máximo uma vez por dia, e apenas se o aplicativo estiver aberto no momento configurado.
- **Backup manual:** botão disponível na tela de Configurações, executável a qualquer momento.

O conteúdo do backup é um arquivo `.zip` contendo o banco de dados, a pasta de uploads e a pasta de configurações, seguindo o padrão de nomenclatura `Backup_AAAA-MM-DD_HHMM.zip`.

### 8.2 Decisão de escopo

Uma versão inicial incluía backup automático também ao fechar o aplicativo; essa funcionalidade foi removida por decisão de simplicidade — o agendamento diário e o botão manual já cobrem a necessidade prática, sem a complexidade adicional de interceptar o evento de fechamento do processo.

---

## 9. Build e Distribuição

### 9.1 Processo de geração do instalador

1. **Template de banco:** um banco SQLite migrado e populado com os dados padrão é gerado antecipadamente (`resources/gabinete-template.db`) e embutido no instalador. Na primeira execução em uma máquina nova, esse template é copiado para `%ProgramData%\GabineteFacil\`, evitando a necessidade de embutir o CLI do Prisma (ferramenta de desenvolvimento) no produto final.
2. **Exportação do Next.js:** compilação para arquivos estáticos, com prefixo de caminho relativo (`assetPrefix: "./"`) para funcionar corretamente ao ser carregado via protocolo `file://` pelo Electron — diferente do protocolo HTTP usado em desenvolvimento.
3. **Compilação do processo Electron:** via esbuild, com os pacotes que possuem binários nativos ou dependências de sistema de arquivo (Prisma Client, pdfkit, exceljs, archiver) marcados como externos ao bundle, evitando problemas de resolução de caminho.
4. **Empacotamento final:** via electron-builder, gerando um instalador NSIS. O pacote é distribuído **sem compressão asar**, decisão tomada após identificar incompatibilidade entre o motor nativo do Prisma e a resolução de módulos dentro de arquivos asar.

### 9.2 Distribuição e instalação

- Instalação **por usuário** (não exige permissão de administrador), no padrão `%LOCALAPPDATA%\Programs\gabinete-facil\` — mesmo comportamento adotado por aplicativos como VS Code e Discord.
- Dados da aplicação (banco, uploads, backups, configurações) ficam sempre em `%ProgramData%\GabineteFacil\`, independente de onde o executável está instalado — permitindo que atualizações do programa não afetem os dados, e que a desinstalação preserve o histórico se desejado.
- Único artefato necessário para distribuição: o arquivo `Gabinete Fácil Setup x.x.x.exe`.

---

## 10. Decisões Técnicas Notáveis

Registro de escolhas que trocaram sofisticação técnica por simplicidade e manutenibilidade, alinhadas ao princípio de projeto definido desde o início:

- **bcryptjs em vez de bcrypt nativo** — elimina dependência de toolchain de compilação C++, essencial para simplificar o processo de build multiplataforma.
- **Ordenação de prioridade em memória, não em SQL** — como o SQLite armazena enums como texto (sem peso numérico nativo), a ordenação por prioridade em Demandas é feita em JavaScript após a consulta. Solução aceitável para o volume de dados esperado (uso local de um gabinete); haveria necessidade de revisão caso o volume crescesse para dezenas de milhares de registros.
- **Sem paginação nos seletores de relacionamento** (`<select>` de Cidadão/Assessor nos formulários) — usa um limite alto (10.000 registros) em vez de paginação real, evitando a complexidade de um combobox com busca assíncrona para um volume de dados que não a justifica.
- **Validação de perfil apenas na interface** — decisão consciente de escopo mínimo, dado o uso interno e o número reduzido de usuários simultâneos previstos para o sistema.

---

## 11. Possíveis Extensões Futuras

Itens que não fazem parte do escopo atual, mas podem ser considerados em iterações futuras:

- Validação de permissão de perfil também na camada de backend (redundância de segurança)
- Paginação real (com busca assíncrona) nos seletores de relacionamento, caso o volume de cidadãos/assessores cresça significativamente
- Otimização da ordenação por prioridade em Demandas via coluna numérica auxiliar, caso o volume de registros justifique
- Assinatura de código do instalador, para evitar alertas do Windows SmartScreen em instalações futuras
