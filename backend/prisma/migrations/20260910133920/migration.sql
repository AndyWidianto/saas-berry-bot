-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "isProductActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "productSetting" JSONB;
