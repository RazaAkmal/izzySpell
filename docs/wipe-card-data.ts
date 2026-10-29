/**
 * Clears stored card details from the users table.
 *
 * DEFAULT = DRY RUN: only COUNTS users that have any non-null card column and
 * prints that number. Nothing is written.
 *
 *   node --env-file=.env docs/wipe-card-data.ts             # dry run (read-only)
 *   node --env-file=.env docs/wipe-card-data.ts --execute   # sets the 5 card columns to NULL
 *
 * --execute runs ONE updateMany that sets card_number, card_name, expire_month,
 * expire_year and card_cvc to NULL for exactly those users, then prints how many
 * rows changed. No other column is touched; no column is dropped.
 *
 * It never prints card values, names or ids - only counts.
 * Uses PRISMA_URL from .env (the shared production Neon database).
 */
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;

const EXECUTE = process.argv.includes("--execute");

// Any card column holding something (including the text "undefined" written by
// the old profile step) counts as stored card data.
const HAS_CARD_DATA = {
  OR: [
    { cardNumber: { not: null } },
    { cardName: { not: null } },
    { expireMonth: { not: null } },
    { expireYear: { not: null } },
    { cardCVC: { not: null } },
  ],
};

async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count({ where: HAS_CARD_DATA });
    console.log(`Users with stored card data: ${count}`);

    if (!EXECUTE) {
      console.log("DRY RUN - nothing was changed. Re-run with --execute to set the 5 card columns to NULL.");
      return;
    }
    if (count === 0) {
      console.log("Nothing to clear.");
      return;
    }

    const result = await prisma.user.updateMany({
      where: HAS_CARD_DATA,
      data: { cardNumber: null, cardName: null, expireMonth: null, expireYear: null, cardCVC: null },
    });
    console.log(`Cleared card data for ${result.count} user(s).`);

    const remaining = await prisma.user.count({ where: HAS_CARD_DATA });
    console.log(`Users with stored card data after clearing: ${remaining}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  // Print only the message; never dump objects that could contain row data
  console.error("Failed:", error instanceof Error ? error.message : "unknown error");
  process.exit(1);
});
