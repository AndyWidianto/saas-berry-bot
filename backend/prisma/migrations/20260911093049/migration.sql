/*
  Warnings:

  - You are about to drop the column `customerAddress` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `orders` table. All the data in the column will be lost.
  - Added the required column `details` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "customerAddress",
DROP COLUMN "customerName",
DROP COLUMN "customerPhone",
ADD COLUMN     "details" JSONB NOT NULL;
