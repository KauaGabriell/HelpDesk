-- DropForeignKey
ALTER TABLE "ticket_services" DROP CONSTRAINT "ticket_services_serviceId_fkey";

-- AlterTable
ALTER TABLE "ticket_services" ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "serviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ticket_services" ADD CONSTRAINT "ticket_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
