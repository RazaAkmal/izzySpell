-- CreateIndex
CREATE INDEX "flash_cards_listId_idx" ON "flash_cards"("listId");

-- CreateIndex
CREATE INDEX "grouped_words_listId_idx" ON "grouped_words"("listId");

-- CreateIndex
CREATE INDEX "grouped_words_listId_studied_idx" ON "grouped_words"("listId", "studied");

-- CreateIndex
CREATE INDEX "grouped_words_listId_groupName_idx" ON "grouped_words"("listId", "groupName");

-- CreateIndex
CREATE INDEX "scramble_words_listId_idx" ON "scramble_words"("listId");

-- CreateIndex
CREATE INDEX "syllable_words_listId_idx" ON "syllable_words"("listId");

-- CreateIndex
CREATE INDEX "syllable_words_listId_studied_idx" ON "syllable_words"("listId", "studied");

-- CreateIndex
CREATE INDEX "words_listId_idx" ON "words"("listId");

-- CreateIndex
CREATE INDEX "words_listId_studied_idx" ON "words"("listId", "studied");
