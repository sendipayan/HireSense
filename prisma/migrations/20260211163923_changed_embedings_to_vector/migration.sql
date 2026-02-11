/*
  Warnings:

  - Changed the type of `embedding` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `embedding` on the `Skill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Role" DROP COLUMN "embedding",
ADD COLUMN     "embedding" vector(384) NOT NULL;

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "embedding",
ADD COLUMN     "embedding" vector(384) NOT NULL;
