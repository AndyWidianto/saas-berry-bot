/*
  Warnings:

  - The `role` column on the `workspace_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RoleWorkspaceMember" AS ENUM ('ADMIN', 'OWNER', 'MEMBER');

-- AlterTable
ALTER TABLE "workspace_members" DROP COLUMN "role",
ADD COLUMN     "role" "RoleWorkspaceMember" NOT NULL DEFAULT 'MEMBER';
