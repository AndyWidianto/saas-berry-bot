-- CreateTable
CREATE TABLE "AiLog" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "isEscalated" BOOLEAN NOT NULL DEFAULT false,
    "modelName" TEXT,
    "latencyMs" INTEGER,
    "tokensUsed" INTEGER,
    "messageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiLog_messageId_key" ON "AiLog"("messageId");

-- CreateIndex
CREATE INDEX "AiLog_confidence_idx" ON "AiLog"("confidence");

-- CreateIndex
CREATE INDEX "AiLog_isFallback_idx" ON "AiLog"("isFallback");

-- CreateIndex
CREATE INDEX "AiLog_isEscalated_idx" ON "AiLog"("isEscalated");

-- CreateIndex
CREATE INDEX "AiLog_createdAt_idx" ON "AiLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AiLog" ADD CONSTRAINT "AiLog_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
