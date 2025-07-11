/*
  Warnings:

  - You are about to alter the column `grade` on the `quiz_attempts` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - Added the required column `updatedAt` to the `quiz_attempts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `quiz_mistakes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_spellingListId_fkey";

-- DropForeignKey
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_userId_fkey";

-- DropForeignKey
ALTER TABLE "quiz_mistakes" DROP CONSTRAINT "quiz_mistakes_quizAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "quiz_mistakes" DROP CONSTRAINT "quiz_mistakes_wordId_fkey";

-- AlterTable
ALTER TABLE "quiz_attempts" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "correctAnswers" SET DEFAULT 0,
ALTER COLUMN "incorrectAnswers" SET DEFAULT 0,
ALTER COLUMN "grade" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "quiz_mistakes" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");

-- CreateIndex
CREATE INDEX "quiz_attempts_spellingListId_idx" ON "quiz_attempts"("spellingListId");

-- CreateIndex
CREATE INDEX "quiz_mistakes_quizAttemptId_idx" ON "quiz_mistakes"("quizAttemptId");

-- CreateIndex
CREATE INDEX "quiz_mistakes_wordId_idx" ON "quiz_mistakes"("wordId");

-- CreateIndex
CREATE INDEX "quiz_mistakes_userId_idx" ON "quiz_mistakes"("userId");

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_spellingListId_fkey" FOREIGN KEY ("spellingListId") REFERENCES "spelling_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_mistakes" ADD CONSTRAINT "quiz_mistakes_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_mistakes" ADD CONSTRAINT "quiz_mistakes_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_mistakes" ADD CONSTRAINT "quiz_mistakes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
