-- CreateTable
CREATE TABLE "scramble_words" (
    "id" SERIAL NOT NULL,
    "listId" INTEGER NOT NULL,
    "originalWord" TEXT NOT NULL,
    "scrambledOptions" JSONB NOT NULL,

    CONSTRAINT "scramble_words_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "scramble_words" ADD CONSTRAINT "scramble_words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
