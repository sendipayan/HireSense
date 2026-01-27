/*
  Warnings:

  - You are about to drop the column `embedding` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `Skill` table. All the data in the column will be lost.
  - Added the required column `category` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Skill` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Role" DROP COLUMN "embedding",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "embedding",
ADD COLUMN     "category" TEXT NOT NULL;
