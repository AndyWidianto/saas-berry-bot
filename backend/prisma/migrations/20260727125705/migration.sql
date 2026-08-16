/*
  Warnings:

  - You are about to drop the column `userId` on the `devices` table. All the data in the column will be lost.
  - Added the required column `workspaceId` to the `devices` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_userId_fkey";

-- DropIndex
DROP INDEX "devices_number_instanceName_userId_idx";

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "userId",
ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "devices_number_instanceName_workspaceId_idx" ON "devices"("number", "instanceName", "workspaceId");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
