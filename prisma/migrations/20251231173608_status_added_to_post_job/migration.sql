-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "PostJob" ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE';
