-- UNDO for 2026_10_29_auth_email_consent.sql
-- Removes ONLY what that migration added: the "password_reset_tokens" table (with its
-- indexes and foreign key) and the 4 columns it added to "users". Nothing else.
-- WARNING: data in these columns/table is lost (parent emails, consent timestamps,
-- reset tokens, password-changed timestamps).
-- Idempotent: safe to run twice.
--
-- No BEGIN/COMMIT here: docs/apply-auth-migration.mjs runs every statement in ONE
-- transaction. With psql use:  psql --single-transaction -f <this file>
-- Lines "-- statement-break" separate statements for the apply script.

-- Dropping the table also drops its indexes and its foreign key to "users"
DROP TABLE IF EXISTS "password_reset_tokens";
-- statement-break

ALTER TABLE "users" DROP COLUMN IF EXISTS "consent_version";
-- statement-break
ALTER TABLE "users" DROP COLUMN IF EXISTS "parent_consent_at";
-- statement-break
ALTER TABLE "users" DROP COLUMN IF EXISTS "parent_email";
-- statement-break
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_changed_at";
