-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "activeChatModelId" TEXT NOT NULL DEFAULT 'deepseek-v4-flash',
ADD COLUMN     "activeEmbeddingModelId" TEXT NOT NULL DEFAULT 'text-embedding-3-small';
