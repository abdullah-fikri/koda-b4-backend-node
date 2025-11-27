/*
  Warnings:

  - Added the required column `add_price` to the `methods` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_methods" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "add_price" INTEGER NOT NULL
);
INSERT INTO "new_methods" ("id", "name") SELECT "id", "name" FROM "methods";
DROP TABLE "methods";
ALTER TABLE "new_methods" RENAME TO "methods";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
