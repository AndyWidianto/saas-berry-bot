-- AlterTable
ALTER TABLE "knowledge_items" ADD COLUMN     "productId" TEXT,
ALTER COLUMN "knowledgeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
