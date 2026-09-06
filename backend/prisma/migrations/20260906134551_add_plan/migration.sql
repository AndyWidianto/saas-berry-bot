-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PAY_AS_YOU_GO', 'PRO_MONTHLY');

-- AlterTable
ALTER TABLE "workspaces" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';
