/*
  Warnings:

  - The `isVerified` column on the `Recruiter` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "verificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Recruiter" ADD COLUMN     "failedReasons" JSONB,
DROP COLUMN "isVerified",
ADD COLUMN     "isVerified" "verificationStatus" NOT NULL DEFAULT 'PENDING';
