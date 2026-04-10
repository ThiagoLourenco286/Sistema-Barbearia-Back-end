/*
  Warnings:

  - A unique constraint covering the columns `[serviço]` on the table `services` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "services_serviço_key" ON "services"("serviço");
