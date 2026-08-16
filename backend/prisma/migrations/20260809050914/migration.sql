/*
  Warnings:

  - Changed the type of `platform` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "platform",
ADD COLUMN     "platform" "PlatformType" NOT NULL;

-- CreateIndex
CREATE INDEX "messages_platform_sender_id_idx" ON "messages"("platform", "sender_id");
