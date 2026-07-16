-- DropForeignKey
ALTER TABLE "ticket_services" DROP CONSTRAINT "ticket_services_addedById_fkey";

-- AddForeignKey
ALTER TABLE "ticket_services" ADD CONSTRAINT "ticket_services_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
