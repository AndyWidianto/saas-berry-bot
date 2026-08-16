/*
  Warnings:

  - Added the required column `workspaceId` to the `AiLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AiLog" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AiLog" ADD CONSTRAINT "AiLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
