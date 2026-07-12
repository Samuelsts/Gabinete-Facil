-- CreateTable
CREATE TABLE "indicacoes_oficios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "numero_protocolo" TEXT,
    "destinatario" TEXT,
    "data_registro" DATETIME NOT NULL,
    "responsavel_usuario_id" INTEGER NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "data_conclusao" DATETIME,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" INTEGER,
    "atualizado_por_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "indicacoes_oficios_responsavel_usuario_id_fkey" FOREIGN KEY ("responsavel_usuario_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "indicacoes_oficios_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "indicacoes_oficios_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "indicacao_oficio_anexos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "indicacao_oficio_id" INTEGER NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "data_envio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "indicacao_oficio_anexos_indicacao_oficio_id_fkey" FOREIGN KEY ("indicacao_oficio_id") REFERENCES "indicacoes_oficios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
