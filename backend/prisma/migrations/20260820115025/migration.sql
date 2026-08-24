/*
  Warnings:

  - You are about to drop the column `messageId` on the `AiLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AiLog" DROP CONSTRAINT "AiLog_messageId_fkey";

-- DropIndex
DROP INDEX "AiLog_messageId_key";

-- AlterTable
ALTER TABLE "AiLog" DROP COLUMN "messageId",
ADD COLUMN     "senderJid" TEXT;
