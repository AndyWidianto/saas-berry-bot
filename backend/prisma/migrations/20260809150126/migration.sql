-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "activeChatModelId" DROP NOT NULL,
ALTER COLUMN "activeChatModelId" DROP DEFAULT,
ALTER COLUMN "activeEmbeddingModelId" DROP NOT NULL,
ALTER COLUMN "activeEmbeddingModelId" DROP DEFAULT;
