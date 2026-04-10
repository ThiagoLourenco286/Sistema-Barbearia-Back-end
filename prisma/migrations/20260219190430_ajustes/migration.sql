-- DropForeignKey
ALTER TABLE "barbers" DROP CONSTRAINT "barbers_id_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_id_fkey";

-- AddForeignKey
ALTER TABLE "barbers" ADD CONSTRAINT "barbers_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
