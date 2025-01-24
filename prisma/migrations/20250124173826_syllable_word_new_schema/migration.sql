-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "age" TEXT,
    "grade" TEXT,
    "profileImage" TEXT,
    "profileUpdated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "card_number" TEXT,
    "card_name" TEXT,
    "expire_month" TEXT,
    "expire_year" TEXT,
    "card_cvc" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spelling_list" (
    "id" SERIAL NOT NULL,
    "listName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "spelling_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" SERIAL NOT NULL,
    "listId" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "difficultyLevel" TEXT NOT NULL DEFAULT 'medium',
    "type" TEXT NOT NULL DEFAULT 'original',
    "studied" BOOLEAN NOT NULL DEFAULT false,

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

-- CreateTable
CREATE TABLE "syllable_words" (
    "id" SERIAL NOT NULL,
    "listId" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "syllable_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- AddForeignKey
ALTER TABLE "spelling_list" ADD CONSTRAINT "spelling_list_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grouped_words" ADD CONSTRAINT "grouped_words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "syllable_words" ADD CONSTRAINT "syllable_words_listId_fkey" FOREIGN KEY ("listId") REFERENCES "spelling_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
