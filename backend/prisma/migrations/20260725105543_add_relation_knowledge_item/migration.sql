/*
  Warnings:

  - Added the required column `knowledgeId` to the `knowledge_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "knowledge_items" ADD COLUMN     "knowledgeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "knowledges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
