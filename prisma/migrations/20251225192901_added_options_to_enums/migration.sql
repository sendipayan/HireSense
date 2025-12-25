-- AlterEnum
ALTER TYPE "Availability" ADD VALUE 'NONE';

-- AlterEnum
ALTER TYPE "CandidateStatus" ADD VALUE 'NONE';

-- AlterEnum
ALTER TYPE "ExperienceLevel" ADD VALUE 'NONE';

-- AlterEnum
ALTER TYPE "JobType" ADD VALUE 'NONE';

-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "graduationYear" SET DATA TYPE TEXT;
