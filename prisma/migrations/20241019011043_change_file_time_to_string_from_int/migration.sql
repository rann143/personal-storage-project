/*
  Warnings:

  - Made the column `uploadTime` on table `File` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "File" ALTER COLUMN "uploadTime" SET NOT NULL,
ALTER COLUMN "uploadTime" SET DATA TYPE TEXT;
