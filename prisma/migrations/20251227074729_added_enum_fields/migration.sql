-- AlterEnum
ALTER TYPE "Department" ADD VALUE 'NONE';

-- AlterEnum
ALTER TYPE "ExperienceRequired" ADD VALUE 'NONE';

-- AlterTable
ALTER TABLE "PostJob" ALTER COLUMN "maxSalary" SET DATA TYPE BIGINT;
