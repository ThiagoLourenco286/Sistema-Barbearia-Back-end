-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_user_id_fkey";

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
