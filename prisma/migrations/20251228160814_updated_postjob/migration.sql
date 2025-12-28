/*
  Warnings:

  - The `optional` column on the `PostJob` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `requirements` on the `PostJob` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PostJob" DROP COLUMN "requirements",
ADD COLUMN     "requirements" JSONB NOT NULL,
DROP COLUMN "optional",
ADD COLUMN     "optional" JSONB;
