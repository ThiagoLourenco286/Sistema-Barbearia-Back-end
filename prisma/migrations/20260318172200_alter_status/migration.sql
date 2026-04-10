/*
  Warnings:

  - Changed the type of `status` on the `barbers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('EM_ATENDIMENTO', 'DISPONIVEL', 'FOLGA', 'AUSENTE');

-- AlterTable
ALTER TABLE "barbers" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;
