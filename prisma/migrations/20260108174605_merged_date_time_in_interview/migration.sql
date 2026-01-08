/*
  Warnings:

  - You are about to drop the column `date` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Interview` table. All the data in the column will be lost.
  - Added the required column `startAt` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "date",
DROP COLUMN "startTime",
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL;
