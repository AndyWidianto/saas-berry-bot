-- DropIndex
DROP INDEX "token_balances_model_code_key";

-- AlterTable
ALTER TABLE "token_balances" ADD COLUMN     "is_used" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 1;
