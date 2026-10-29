/**
 * READ-ONLY check: lists usernames that differ only by letter case
 * (e.g. "Raza" and "raza"). Runs a single SELECT - it never writes.
 *
 * Run (Node 22.6+ / 24, from the project root):
 *   node --env-file=.env docs/check-duplicate-usernames.ts
 *
 * Uses PRISMA_URL from .env (the shared production Neon database).
 */
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;

type DuplicateGroup = { lower_name: string; names: string[]; ids: string[]; count: number };

async function main() {
  const prisma = new PrismaClient();
  try {
    const groups = await prisma.$queryRaw<DuplicateGroup[]>`
      SELECT lower(name)               AS lower_name,
             array_agg(name ORDER BY name) AS names,
             array_agg(id ORDER BY name)   AS ids,
             count(*)::int             AS count
      FROM users
      GROUP BY lower(name)
      HAVING count(*) > 1
      ORDER BY lower(name)
    `;

    if (groups.length === 0) {
      console.log("No case-insensitive duplicate usernames found.");
      return;
    }
    console.log(`Found ${groups.length} group(s) of usernames that differ only by case:\n`);
    for (const group of groups) {
      console.log(`- "${group.lower_name}" (${group.count} accounts): ${group.names.map((n) => JSON.stringify(n)).join(", ")}`);
      console.log(`    ids: ${group.ids.join(", ")}`);
    }
    console.log(
      "\nThese accounts can still log in with their exact username. A case-insensitive" +
        " lookup that matches more than one of them is treated as 'not found'."
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Check failed:", error);
  process.exit(1);
});
