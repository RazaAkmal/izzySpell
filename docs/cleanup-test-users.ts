/**
 * Deletes leftover TEST users.
 *
 * DEFAULT = DRY RUN: prints which allow-listed test users exist and which of them it
 * WOULD delete. Nothing is written.
 *
 *   node --env-file=.env docs/cleanup-test-users.ts             # dry run (read-only)
 *   node --env-file=.env docs/cleanup-test-users.ts --execute   # delete
 *
 * A user is deleted ONLY if ALL of these are true:
 *   1. its name is EXACTLY one of the names in ALLOW_LIST below,
 *   2. its name starts with "zz",
 *   3. it owns zero spelling lists.
 * Deleting a user also deletes (ON DELETE CASCADE) its quiz attempts, quiz mistakes and
 * password reset tokens. Nothing else is touched.
 *
 * Output: test usernames and counts only - never emails, password hashes or other data.
 * Uses PRISMA_URL from .env (the shared production Neon database).
 */
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;

// Exact usernames that may be deleted. Add names here deliberately, one by one.
const ALLOW_LIST: string[] = ["zzmanual1", "zztest"];

const EXECUTE = process.argv.includes("--execute");

async function main() {
  const allowed = ALLOW_LIST.filter((name) => name.startsWith("zz"));
  const ignored = ALLOW_LIST.filter((name) => !name.startsWith("zz"));
  if (ignored.length) console.log(`Ignoring allow-list entries that do not start with "zz": ${ignored.length}`);

  const prisma = new PrismaClient();
  try {
    const found = await prisma.user.findMany({
      where: { name: { in: allowed } }, // exact, case-sensitive match
      select: { id: true, name: true, _count: { select: { spellingLists: true } } },
      orderBy: { name: "asc" },
    });

    const deletable = found.filter((u) => u.name.startsWith("zz") && u._count.spellingLists === 0);
    const kept = found.filter((u) => !deletable.includes(u));

    console.log(`Allow-listed names: ${allowed.length} | found in database: ${found.length} | deletable: ${deletable.length}`);
    for (const u of deletable) console.log(`  ${EXECUTE ? "deleting" : "would delete"}: ${u.name}`);
    for (const u of kept) console.log(`  keeping: ${u.name} (owns ${u._count.spellingLists} spelling list(s))`);

    if (!EXECUTE) {
      console.log("DRY RUN - nothing was changed. Re-run with --execute to delete the users listed above.");
      return;
    }
    if (deletable.length === 0) {
      console.log("Nothing to delete.");
      return;
    }

    // Same three conditions repeated in the delete itself
    const result = await prisma.user.deleteMany({
      where: {
        id: { in: deletable.map((u) => u.id) },
        name: { in: allowed, startsWith: "zz" },
        spellingLists: { none: {} },
      },
    });
    console.log(`Deleted ${result.count} user(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  // Message only; never dump objects that could contain row data
  console.error("Failed:", error instanceof Error ? error.message : "unknown error");
  process.exit(1);
});
