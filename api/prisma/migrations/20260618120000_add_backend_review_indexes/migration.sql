-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "services_isActive_idx" ON "services"("isActive");

-- CreateIndex
CREATE INDEX "services_serviceCategory_idx" ON "services"("serviceCategory");

-- CreateIndex
CREATE INDEX "tickets_clientId_idx" ON "tickets"("clientId");

-- CreateIndex
CREATE INDEX "tickets_technicianId_idx" ON "tickets"("technicianId");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "tickets_created_at_idx" ON "tickets"("created_at");

-- CreateIndex
CREATE INDEX "ticket_services_ticketId_idx" ON "ticket_services"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_services_serviceId_idx" ON "ticket_services"("serviceId");

-- CreateIndex
CREATE INDEX "ticket_services_addedById_idx" ON "ticket_services"("addedById");
