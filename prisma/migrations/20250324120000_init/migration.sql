-- CreateTable
CREATE TABLE "Todo" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick status filtering
CREATE INDEX "Todo_completed_idx" ON "Todo"("completed");
