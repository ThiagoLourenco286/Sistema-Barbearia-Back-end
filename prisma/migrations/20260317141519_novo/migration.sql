/*
  Warnings:

  - You are about to drop the column `serviço` on the `services` table. All the data in the column will be lost.
  - Added the required column `service` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "serviço",
ADD COLUMN     "service" TEXT NOT NULL;
