/*
  Warnings:

  - You are about to drop the column `responsavel_usuario_id` on the `atendimentos` table. All the data in the column will be lost.
  - You are about to drop the column `responsavel_usuario_id` on the `comunidades` table. All the data in the column will be lost.
  - You are about to drop the column `responsavel_usuario_id` on the `demandas` table. All the data in the column will be lost.
  - You are about to drop the column `responsavel_usuario_id` on the `indicacoes_oficios` table. All the data in the column will be lost.
  - Added the required column `responsavel_assessor_id` to the `atendimentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsavel_assessor_id` to the `comunidades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsavel_assessor_id` to the `demandas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsavel_assessor_id` to the `indicacoes_oficios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "assessores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "celular" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "data_nascimento" DATETIME,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" INTEGER,
    "atualizado_por_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "assessores_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "assessores_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_atendimentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cidadao_id" INTEGER NOT NULL,
    "bairro" TEXT,
    "data_atendimento" DATETIME NOT NULL,
    "responsavel_assessor_id" INTEGER NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "data_conclusao" DATETIME,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" INTEGER,
    "atualizado_por_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "atendimentos_cidadao_id_fkey" FOREIGN KEY ("cidadao_id") REFERENCES "cidadaos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "atendimentos_responsavel_assessor_id_fkey" FOREIGN KEY ("responsavel_assessor_id") REFERENCES "assessores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "atendimentos_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "atendimentos_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_atendimentos" ("ativo", "atualizado_por_id", "bairro", "cidadao_id", "created_at", "criado_por_id", "data_atendimento", "data_conclusao", "descricao", "id", "status", "updated_at") SELECT "ativo", "atualizado_por_id", "bairro", "cidadao_id", "created_at", "criado_por_id", "data_atendimento", "data_conclusao", "descricao", "id", "status", "updated_at" FROM "atendimentos";
DROP TABLE "atendimentos";
ALTER TABLE "new_atendimentos" RENAME TO "atendimentos";
CREATE TABLE "new_comunidades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT,
    "bairro" TEXT NOT NULL,
    "descricao_acao" TEXT,
    "lider_comunidade" TEXT,
    "responsavel_assessor_id" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "data_conclusao" DATETIME,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" INTEGER,
    "atualizado_por_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "comunidades_responsavel_assessor_id_fkey" FOREIGN KEY ("responsavel_assessor_id") REFERENCES "assessores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comunidades_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "comunidades_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_comunidades" ("ativo", "atualizado_por_id", "bairro", "created_at", "criado_por_id", "data", "data_conclusao", "descricao_acao", "id", "lider_comunidade", "nome", "status", "updated_at") SELECT "ativo", "atualizado_por_id", "bairro", "created_at", "criado_por_id", "data", "data_conclusao", "descricao_acao", "id", "lider_comunidade", "nome", "status", "updated_at" FROM "comunidades";
DROP TABLE "comunidades";
ALTER TABLE "new_comunidades" RENAME TO "comunidades";
CREATE TABLE "new_demandas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cidadao_id" INTEGER NOT NULL,
    "bairro" TEXT,
    "data_abertura" DATETIME NOT NULL,
    "responsavel_assessor_id" INTEGER NOT NULL,
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
    CONSTRAINT "demandas_responsavel_assessor_id_fkey" FOREIGN KEY ("responsavel_assessor_id") REFERENCES "assessores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "demandas_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "demandas_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_demandas" ("ativo", "atualizado_por_id", "bairro", "cidadao_id", "created_at", "criado_por_id", "data_abertura", "data_conclusao", "descricao", "id", "prioridade", "status", "updated_at") SELECT "ativo", "atualizado_por_id", "bairro", "cidadao_id", "created_at", "criado_por_id", "data_abertura", "data_conclusao", "descricao", "id", "prioridade", "status", "updated_at" FROM "demandas";
DROP TABLE "demandas";
ALTER TABLE "new_demandas" RENAME TO "demandas";
CREATE TABLE "new_indicacoes_oficios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "numero_protocolo" TEXT,
    "destinatario" TEXT,
    "data_registro" DATETIME NOT NULL,
    "responsavel_assessor_id" INTEGER NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "data_conclusao" DATETIME,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" INTEGER,
    "atualizado_por_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "indicacoes_oficios_responsavel_assessor_id_fkey" FOREIGN KEY ("responsavel_assessor_id") REFERENCES "assessores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "indicacoes_oficios_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "indicacoes_oficios_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_indicacoes_oficios" ("ativo", "atualizado_por_id", "created_at", "criado_por_id", "data_conclusao", "data_registro", "descricao", "destinatario", "id", "numero_protocolo", "status", "tipo", "updated_at") SELECT "ativo", "atualizado_por_id", "created_at", "criado_por_id", "data_conclusao", "data_registro", "descricao", "destinatario", "id", "numero_protocolo", "status", "tipo", "updated_at" FROM "indicacoes_oficios";
DROP TABLE "indicacoes_oficios";
ALTER TABLE "new_indicacoes_oficios" RENAME TO "indicacoes_oficios";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
