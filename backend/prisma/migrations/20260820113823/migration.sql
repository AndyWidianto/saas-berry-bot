/*
  Warnings:

  - You are about to drop the column `isAutoAssignEnabled` on the `workspaces` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `workspaces` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "workspaces_slug_key";

-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "isAutoAssignEnabled",
DROP COLUMN "slug";
