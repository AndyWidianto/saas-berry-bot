/*
  Warnings:

  - You are about to drop the column `productSetting` on the `workspaces` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "productSetting",
ADD COLUMN     "productSettings" JSONB;
