-- CreateTable
CREATE TABLE "cidadaos" (
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
    CONSTRAINT "cidadaos_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cidadaos_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
