/*
  Warnings:

  - The `category` column on the `Role` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `category` column on the `Skill` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Role" DROP COLUMN "category",
ADD COLUMN     "category" TEXT[];

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "category",
ADD COLUMN     "category" TEXT[];
