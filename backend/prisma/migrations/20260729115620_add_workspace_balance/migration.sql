/*
  Warnings:

  - The `platform` column on the `devices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[model_code]` on the table `token_balances` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `provider` on the `ai_models` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `model_code` to the `token_balances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `token_balances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `token_balances` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('TOPUP', 'USAGE', 'REFUND');

-- CreateEnum
CREATE TYPE "PlatformType" AS ENUM ('WHATSAPP_BAYLIES', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "ProviderAI" AS ENUM ('GOOGLE', 'OPENAI', 'MISTRAL', 'LOCAL_OLLAMA');

-- AlterTable
ALTER TABLE "ai_models" DROP COLUMN "provider",
ADD COLUMN     "provider" "ProviderAI" NOT NULL;

-- AlterTable
ALTER TABLE "devices" DROP COLUMN "platform",
ADD COLUMN     "platform" "PlatformType" NOT NULL DEFAULT 'WHATSAPP_BAYLIES';

-- AlterTable
ALTER TABLE "token_balances" ADD COLUMN     "model_code" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "provider" "ProviderAI" NOT NULL;

-- CreateTable
CREATE TABLE "workspace_balances" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "amount" DECIMAL(15,4) NOT NULL DEFAULT 0.0000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_transactions" (
    "id" TEXT NOT NULL,
    "workspace_balance_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_balances_workspace_id_key" ON "workspace_balances"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "token_balances_model_code_key" ON "token_balances"("model_code");

-- AddForeignKey
ALTER TABLE "workspace_balances" ADD CONSTRAINT "workspace_balances_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_workspace_balance_id_fkey" FOREIGN KEY ("workspace_balance_id") REFERENCES "workspace_balances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
