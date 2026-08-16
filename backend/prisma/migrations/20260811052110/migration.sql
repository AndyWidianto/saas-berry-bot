-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "workspace_members" ADD COLUMN     "invited_by" TEXT,
ADD COLUMN     "invited_email" TEXT,
ADD COLUMN     "last_active_at" TIMESTAMP(3),
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "workspace_members_workspace_id_status_idx" ON "workspace_members"("workspace_id", "status");
