-- AlterTable
ALTER TABLE "users" ADD COLUMN     "age" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "profileUpdated" BOOLEAN NOT NULL DEFAULT false;
