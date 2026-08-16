/*
  Warnings:

  - You are about to drop the column `is_used` on the `token_balances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "token_balances" DROP COLUMN "is_used";

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "chunk_overlap" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "chunk_size" INTEGER NOT NULL DEFAULT 500;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_activeEmbeddingModelId_fkey" FOREIGN KEY ("activeEmbeddingModelId") REFERENCES "ai_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_activeChatModelId_fkey" FOREIGN KEY ("activeChatModelId") REFERENCES "ai_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
