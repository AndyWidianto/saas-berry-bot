/*
  Warnings:

  - You are about to drop the column `priority` on the `token_balances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "token_balances" DROP COLUMN "priority",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_primary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "total_used_embedding_token" INTEGER NOT NULL DEFAULT 0;
