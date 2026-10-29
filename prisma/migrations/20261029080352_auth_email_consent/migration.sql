-- Auth: parent email, parental consent, email-based password reset, session invalidation.
-- PURELY ADDITIVE: adds 4 nullable columns to "users" and one new table. Nothing is
-- dropped, renamed or retyped; existing rows are untouched (new columns are NULL).
-- Idempotent: safe to run twice. Types/names match `prisma migrate diff` output for
-- prisma/schema.prisma exactly (TEXT, TIMESTAMP(3), Prisma's index/constraint names).
--
-- No BEGIN/COMMIT here: docs/apply-auth-migration.mjs runs every statement in ONE
-- transaction. With psql use:  psql --single-transaction -f <this file>
-- Lines "-- statement-break" separate statements for the apply script.

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "consent_version" TEXT;
-- statement-break
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "parent_consent_at" TIMESTAMP(3);
-- statement-break
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "parent_email" TEXT;
-- statement-break
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMP(3);
-- statement-break

-- CreateTable
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);
-- statement-break

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");
-- statement-break

-- CreateIndex
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_created_at_idx" ON "password_reset_tokens"("user_id", "created_at");
-- statement-break

-- AddForeignKey (guarded: ADD CONSTRAINT has no IF NOT EXISTS in PostgreSQL)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'password_reset_tokens_user_id_fkey'
      AND conrelid = '"password_reset_tokens"'::regclass
  ) THEN
    ALTER TABLE "password_reset_tokens"
      ADD CONSTRAINT "password_reset_tokens_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
