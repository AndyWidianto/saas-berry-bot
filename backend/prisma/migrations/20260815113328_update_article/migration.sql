/*
  Warnings:

  - You are about to drop the column `createdAt` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `articles` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `articles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "articles" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "author_name" TEXT NOT NULL DEFAULT 'Tim Redaksi',
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "featured_image" TEXT,
ADD COLUMN     "featured_image_alt" TEXT,
ADD COLUMN     "is_indexable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "meta_description" TEXT,
ADD COLUMN     "meta_title" TEXT,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "articles_slug_idx" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_is_published_published_at_idx" ON "articles"("is_published", "published_at");
