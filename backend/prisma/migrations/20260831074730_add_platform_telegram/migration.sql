-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- AlterEnum
ALTER TYPE "PlatformType" ADD VALUE 'TELEGRAM';

-- DropForeignKey
ALTER TABLE "workspaces" DROP CONSTRAINT "workspaces_activeChatModelId_fkey";

-- DropForeignKey
ALTER TABLE "workspaces" DROP CONSTRAINT "workspaces_activeEmbeddingModelId_fkey";

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_activeEmbeddingModelId_fkey" FOREIGN KEY ("activeEmbeddingModelId") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_activeChatModelId_fkey" FOREIGN KEY ("activeChatModelId") REFERENCES "ai_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;
