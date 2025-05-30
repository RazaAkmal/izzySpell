-- AlterTable
ALTER TABLE "grouped_words" ADD COLUMN     "studied" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "syllable_words" ADD COLUMN     "studied" BOOLEAN NOT NULL DEFAULT false;
