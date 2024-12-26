-- CreateTable
CREATE TABLE "syllable_words" (
    "id" SERIAL NOT NULL,
    "listId" INTEGER NOT NULL,
    "syllables" TEXT NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "syllable_words_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "syllable_words" ADD CONSTRAINT "syllable_words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
