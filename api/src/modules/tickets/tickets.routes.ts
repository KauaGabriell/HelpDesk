import { Router } from "express";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { verifyAuthorization } from "../../middlewares/verifyAuthorization";
import { TicketsController } from "./tickets.controller";

const ticketsRoutes = Router();
const adminTicketRoutes = Router();
const technicianTicketRoutes = Router();
const clientTicketRoutes = Router();
const ticketsController = new TicketsController();

ticketsRoutes.use(verifyAuthentication);

adminTicketRoutes.use(verifyAuthorization(["admin"]));
adminTicketRoutes.get("/", ticketsController.listByAdmin);

technicianTicketRoutes.use(verifyAuthorization(["technician"]));
technicianTicketRoutes.get("/me", ticketsController.listByTechnician);

clientTicketRoutes.use(verifyAuthorization(["client"]));
clientTicketRoutes.post("/", ticketsController.create);
clientTicketRoutes.get("/me", ticketsController.listByClient);

ticketsRoutes.use("/admin", adminTicketRoutes);
ticketsRoutes.use("/technician", technicianTicketRoutes);
ticketsRoutes.use("/client", clientTicketRoutes);

export { ticketsRoutes };
