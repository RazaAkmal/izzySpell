-- CreateTable
CREATE TABLE "flash_cards" (
    "id" SERIAL NOT NULL,
    "listId" INTEGER NOT NULL,
    "originalWord" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "definition" TEXT NOT NULL,
    "exampleSentence" TEXT NOT NULL,

    CONSTRAINT "flash_cards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "flash_cards" ADD CONSTRAINT "flash_cards_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
