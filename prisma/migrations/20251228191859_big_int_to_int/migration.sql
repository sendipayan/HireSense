/*
  Warnings:

  - You are about to alter the column `maxSalary` on the `PostJob` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "PostJob" ALTER COLUMN "maxSalary" SET DATA TYPE INTEGER;
