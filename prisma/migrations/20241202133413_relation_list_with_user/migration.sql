-- CreateTable
CREATE TABLE "spelling_list" (
    "id" SERIAL NOT NULL,
    "listName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "spelling_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" SERIAL NOT NULL,
    "listId" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "difficultyLevel" TEXT NOT NULL DEFAULT 'medium',
    "type" TEXT NOT NULL DEFAULT 'original',

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grouped_words" (
    "id" SERIAL NOT NULL,
    "listId" INTEGER NOT NULL,
    "groupName" TEXT NOT NULL,
    "word" TEXT NOT NULL,

    CONSTRAINT "grouped_words_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "spelling_list" ADD CONSTRAINT "spelling_list_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grouped_words" ADD CONSTRAINT "grouped_words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
