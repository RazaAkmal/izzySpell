-- DropForeignKey
ALTER TABLE "flash_cards" DROP CONSTRAINT "flash_cards_listId_fkey";

-- DropForeignKey
ALTER TABLE "grouped_words" DROP CONSTRAINT "grouped_words_listId_fkey";

-- DropForeignKey
ALTER TABLE "scramble_words" DROP CONSTRAINT "scramble_words_listId_fkey";

-- DropForeignKey
ALTER TABLE "syllable_words" DROP CONSTRAINT "syllable_words_listId_fkey";

-- DropForeignKey
ALTER TABLE "words" DROP CONSTRAINT "words_listId_fkey";

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grouped_words" ADD CONSTRAINT "grouped_words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllable_words" ADD CONSTRAINT "syllable_words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_cards" ADD CONSTRAINT "flash_cards_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scramble_words" ADD CONSTRAINT "scramble_words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;
