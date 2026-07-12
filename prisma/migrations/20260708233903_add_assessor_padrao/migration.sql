-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_assessores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "celular" TEXT,
    "endereco" TEXT,
    "bairro" TEXT,
    "data_nascimento" DATETIME,
    "assessor_padrao" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" INTEGER,
    "atualizado_por_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "assessores_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "assessores_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_assessores" ("ativo", "atualizado_por_id", "bairro", "celular", "created_at", "criado_por_id", "data_nascimento", "endereco", "id", "nome", "updated_at") SELECT "ativo", "atualizado_por_id", "bairro", "celular", "created_at", "criado_por_id", "data_nascimento", "endereco", "id", "nome", "updated_at" FROM "assessores";
DROP TABLE "assessores";
ALTER TABLE "new_assessores" RENAME TO "assessores";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
