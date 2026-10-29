/**
 * Applies (or undoes) prisma/manual-migrations/2026_10_29_auth_email_consent.sql
 *
 *   node --env-file=.env docs/apply-auth-migration.mjs                    # DRY RUN: print the SQL, no DB connection
 *   node --env-file=.env docs/apply-auth-migration.mjs --execute          # apply in ONE transaction, then verify
 *   node --env-file=.env docs/apply-auth-migration.mjs --undo             # DRY RUN of the undo SQL
 *   node --env-file=.env docs/apply-auth-migration.mjs --undo --execute   # undo in ONE transaction, then verify
 *
 * - Connects with PRISMA_DIRECT_URL (direct, non-pooled) read from the environment.
 * - Uses the already-installed Prisma client for raw SQL only (no `prisma generate`
 *   needed, no model types used). Run `npx prisma generate` only AFTER --execute succeeds.
 * - lock_timeout = 5s inside the transaction: if "users" is busy the migration fails
 *   fast (and rolls back) instead of queueing and stalling the live app's queries.
 * - Never prints the connection string or any row data; verification only reads
 *   catalog metadata (information_schema / pg_catalog).
 */
import { readFileSync } from "node:fs";
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;

const EXECUTE = process.argv.includes("--execute");
const UNDO = process.argv.includes("--undo");

const FILE = UNDO
  ? "2026_10_29_auth_email_consent_undo.sql"
  : "2026_10_29_auth_email_consent.sql";
const SQL_PATH = new URL(`../prisma/manual-migrations/${FILE}`, import.meta.url);

const NEW_COLUMNS = ["consent_version", "parent_consent_at", "parent_email", "password_changed_at"];
const EXPECTED_TYPES = {
  consent_version: "text",
  parent_consent_at: "timestamp without time zone",
  parent_email: "text",
  password_changed_at: "timestamp without time zone",
};
const NEW_TABLE = "password_reset_tokens";
const NEW_INDEXES = ["password_reset_tokens_pkey", "password_reset_tokens_token_hash_key", "password_reset_tokens_user_id_created_at_idx"];
const NEW_FK = "password_reset_tokens_user_id_fkey";

const redact = (text) => String(text).replace(/postgres(ql)?:\/\/[^\s"'`]+/g, "<redacted-url>");

// Statements are separated by "-- statement-break" lines in the SQL file
function readStatements() {
  const sql = readFileSync(SQL_PATH, "utf8");
  return sql
    .split(/^-- statement-break\s*$/m)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.split("\n").some((line) => line.trim() && !line.trim().startsWith("--")));
}

async function inspect(db) {
  const columns = await db.$queryRawUnsafe(
    `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'users'
        AND column_name = ANY($1::text[])
      ORDER BY column_name`,
    NEW_COLUMNS
  );
  const tables = await db.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_name = $1`,
    NEW_TABLE
  );
  const indexes = await db.$queryRawUnsafe(
    `SELECT indexname FROM pg_indexes
      WHERE schemaname = current_schema() AND tablename = $1 ORDER BY indexname`,
    NEW_TABLE
  );
  const fks = await db.$queryRawUnsafe(
    `SELECT conname, confdeltype::text AS on_delete FROM pg_constraint WHERE conname = $1`,
    NEW_FK
  );
  return { columns, tableExists: tables.length === 1, indexes: indexes.map((i) => i.indexname), fks };
}

function report(state) {
  console.log("\nVerification (catalog metadata only):");
  for (const name of NEW_COLUMNS) {
    const col = state.columns.find((c) => c.column_name === name);
    console.log(
      col
        ? `  users.${name}: present, type=${col.data_type}, nullable=${col.is_nullable}, default=${col.column_default ?? "none"}`
        : `  users.${name}: absent`
    );
  }
  console.log(`  table ${NEW_TABLE}: ${state.tableExists ? "present" : "absent"}`);
  console.log(`  indexes on ${NEW_TABLE}: ${state.indexes.length ? state.indexes.join(", ") : "none"}`);
  console.log(`  foreign key ${NEW_FK}: ${state.fks.length ? `present (on delete = ${state.fks[0].on_delete === "c" ? "CASCADE" : state.fks[0].on_delete})` : "absent"}`);
}

function verifyApplied(state) {
  const problems = [];
  for (const name of NEW_COLUMNS) {
    const col = state.columns.find((c) => c.column_name === name);
    if (!col) problems.push(`column users.${name} missing`);
    else {
      if (col.data_type !== EXPECTED_TYPES[name]) problems.push(`users.${name} has type ${col.data_type}`);
      if (col.is_nullable !== "YES") problems.push(`users.${name} is NOT NULL`);
      if (col.column_default !== null) problems.push(`users.${name} has a default`);
    }
  }
  if (!state.tableExists) problems.push(`table ${NEW_TABLE} missing`);
  for (const idx of NEW_INDEXES) if (!state.indexes.includes(idx)) problems.push(`index ${idx} missing`);
  if (!state.fks.length) problems.push(`foreign key ${NEW_FK} missing`);
  else if (state.fks[0].on_delete !== "c") problems.push(`foreign key ${NEW_FK} is not ON DELETE CASCADE`);
  return problems;
}

function verifyUndone(state) {
  const problems = [];
  for (const col of state.columns) problems.push(`column users.${col.column_name} still present`);
  if (state.tableExists) problems.push(`table ${NEW_TABLE} still present`);
  if (state.fks.length) problems.push(`foreign key ${NEW_FK} still present`);
  return problems;
}

async function main() {
  const statements = readStatements();
  console.log(`${UNDO ? "UNDO" : "APPLY"} using prisma/manual-migrations/${FILE} (${statements.length} statements)`);

  if (!EXECUTE) {
    console.log("\n-- DRY RUN: nothing will be executed, no database connection is made --\n");
    statements.forEach((stmt, i) => console.log(`-- [${i + 1}/${statements.length}]\n${stmt}\n`));
    console.log(`Re-run with ${UNDO ? "--undo --execute" : "--execute"} to run these in ONE transaction.`);
    return;
  }

  if (!process.env.PRISMA_DIRECT_URL) {
    console.error("PRISMA_DIRECT_URL is not set. Run with: node --env-file=.env docs/apply-auth-migration.mjs ...");
    process.exit(1);
  }

  const prisma = new PrismaClient({ datasourceUrl: process.env.PRISMA_DIRECT_URL });
  try {
    console.log("\nExecuting in ONE transaction (all statements succeed, or nothing changes)...");
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe("SET LOCAL lock_timeout = '5s'");
        for (let i = 0; i < statements.length; i++) {
          await tx.$executeRawUnsafe(statements[i]);
          console.log(`  ok  statement ${i + 1}/${statements.length}`);
        }
      },
      { maxWait: 10_000, timeout: 60_000 }
    );
    console.log("Committed.");

    const state = await inspect(prisma);
    report(state);
    const problems = UNDO ? verifyUndone(state) : verifyApplied(state);
    if (problems.length) {
      console.error("\nVERIFICATION FAILED:");
      problems.forEach((p) => console.error(`  - ${p}`));
      process.exitCode = 1;
    } else {
      console.log(`\nVERIFIED: ${UNDO ? "everything this migration added is gone" : "all four columns, the table, its indexes and the foreign key exist as expected"}.`);
      if (!UNDO) console.log("Next: stop `npm run dev`, run `npx prisma generate`, then start `npm run dev` again.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  // Only the (redacted) message: never dump objects that could contain row data or URLs
  console.error("FAILED (transaction rolled back, nothing changed):", redact(error instanceof Error ? error.message : error));
  process.exit(1);
});
