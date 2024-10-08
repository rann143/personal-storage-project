/*
  Warnings:

  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Session` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
CREATE SEQUENCE file_id_seq;
ALTER TABLE "File" ALTER COLUMN "id" SET DEFAULT nextval('file_id_seq');
ALTER SEQUENCE file_id_seq OWNED BY "File"."id";

-- AlterTable
CREATE SEQUENCE folder_id_seq;
ALTER TABLE "Folder" ALTER COLUMN "id" SET DEFAULT nextval('folder_id_seq');
ALTER SEQUENCE folder_id_seq OWNED BY "Folder"."id";

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");
