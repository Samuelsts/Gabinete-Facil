-- CreateTable
CREATE TABLE "demandas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cidadao_id" INTEGER NOT NULL,
    "bairro" TEXT,
    "data_abertura" DATETIME NOT NULL,
    "responsavel_usuario_id" INTEGER NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "prioridade" TEXT NOT NULL DEFAULT 'NORMAL',
    "data_conclusao" DATETIME,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" INTEGER,
    "atualizado_por_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "demandas_cidadao_id_fkey" FOREIGN KEY ("cidadao_id") REFERENCES "cidadaos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "demandas_responsavel_usuario_id_fkey" FOREIGN KEY ("responsavel_usuario_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "demandas_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "demandas_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "demanda_anexos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "demanda_id" INTEGER NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "data_envio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "demanda_anexos_demanda_id_fkey" FOREIGN KEY ("demanda_id") REFERENCES "demandas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
