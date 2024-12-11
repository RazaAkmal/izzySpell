-- AlterTable
ALTER TABLE "spelling_list" ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "words" ADD COLUMN     "studied" BOOLEAN NOT NULL DEFAULT false;
