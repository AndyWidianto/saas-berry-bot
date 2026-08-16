-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "isAiActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isAutoAssignEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
ADD COLUMN     "workingHours" JSONB,
ADD COLUMN     "workingHoursEnabled" BOOLEAN NOT NULL DEFAULT false;
