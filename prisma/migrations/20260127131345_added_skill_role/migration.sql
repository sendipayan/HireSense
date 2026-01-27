/*
  Warnings:

  - You are about to drop the column `preferredRoles` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `primarySkills` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `secondarySkills` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `optional` on the `PostJob` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `PostJob` table. All the data in the column will be lost.
  - You are about to drop the column `hiringForRoles` on the `Recruiter` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'RECRUITER');

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "preferredRoles",
DROP COLUMN "primarySkills",
DROP COLUMN "secondarySkills";

-- AlterTable
ALTER TABLE "PostJob" DROP COLUMN "optional",
DROP COLUMN "requirements";

-- AlterTable
ALTER TABLE "Recruiter" DROP COLUMN "hiringForRoles";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE';

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "embedding" DOUBLE PRECISION[],
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "requiredForJobId" TEXT,
    "optionalForJobId" TEXT,
    "primaryForCandidateId" TEXT,
    "secondaryForCandidateId" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "embedding" DOUBLE PRECISION[],
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT,
    "recruiterId" TEXT,
    "preferredByCandidateId" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_requiredForJobId_fkey" FOREIGN KEY ("requiredForJobId") REFERENCES "PostJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_optionalForJobId_fkey" FOREIGN KEY ("optionalForJobId") REFERENCES "PostJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_primaryForCandidateId_fkey" FOREIGN KEY ("primaryForCandidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_secondaryForCandidateId_fkey" FOREIGN KEY ("secondaryForCandidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Recruiter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_preferredByCandidateId_fkey" FOREIGN KEY ("preferredByCandidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
