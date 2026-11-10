-- The dashboard and /lists query "spelling_list" WHERE "userId" = ? ORDER BY "createdAt" DESC,
-- which scanned the whole table: it had no index besides the primary key.
-- PURELY ADDITIVE and idempotent (safe to run twice).

-- CreateIndex
CREATE INDEX IF NOT EXISTS "spelling_list_userId_createdAt_idx" ON "spelling_list"("userId", "createdAt");
