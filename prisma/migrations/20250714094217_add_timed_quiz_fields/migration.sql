-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN     "expiredWords" INTEGER DEFAULT 0,
ADD COLUMN     "isTimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeAmount" INTEGER,
ADD COLUMN     "timerType" TEXT;
