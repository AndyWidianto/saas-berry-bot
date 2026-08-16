/*
  Warnings:

  - The values [USAGE_REWRTIE] on the enum `CreditTransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CreditTransactionType_new" AS ENUM ('TOP_UP', 'USAGE_CHAT', 'USAGE_RAG', 'REFUND', 'USAGE_REWRITE', 'BONUS');
ALTER TABLE "credit_ledgers" ALTER COLUMN "type" TYPE "CreditTransactionType_new" USING ("type"::text::"CreditTransactionType_new");
ALTER TYPE "CreditTransactionType" RENAME TO "CreditTransactionType_old";
ALTER TYPE "CreditTransactionType_new" RENAME TO "CreditTransactionType";
DROP TYPE "public"."CreditTransactionType_old";
COMMIT;
