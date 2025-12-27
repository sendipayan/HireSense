/*
  Warnings:

  - The values [BOTH] on the enum `JobType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ENGINEERING', 'DESIGN', 'MARKETING', 'SALES', 'SUPPORT', 'HR', 'FINANCE', 'OPERATIONS');

-- CreateEnum
CREATE TYPE "ExperienceRequired" AS ENUM ('ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'LEAD', 'EXECUTIVE');


-- CreateTable
CREATE TABLE "PostJob" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "minSalary" INTEGER NOT NULL,
    "maxSalary" INTEGER NOT NULL,
    "department" "Department" NOT NULL,
    "jobType" "JobType" NOT NULL,
    "experienceRequired" "ExperienceRequired" NOT NULL,
    "requirements" TEXT NOT NULL,
    "optional" TEXT,
    "benifits" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostJob" ADD CONSTRAINT "PostJob_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Recruiter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
