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
adminTicketRoutes.get("/:ticketId", ticketsController.getDetailsByAdmin);
adminTicketRoutes.patch(
	"/:ticketId",
	ticketsController.changeTicketStatusByAdmin,
);

technicianTicketRoutes.use(verifyAuthorization(["technician"]));
technicianTicketRoutes.get("/me", ticketsController.listByTechnician);
technicianTicketRoutes.get(
	"/:ticketId",
	ticketsController.getDetailsByTechnician,
);
technicianTicketRoutes.patch(
	"/:ticketId/start",
	ticketsController.startTicketByTechnician,
);
technicianTicketRoutes.patch(
	"/:ticketId/close",
	ticketsController.closeTicketByTechnician,
);

clientTicketRoutes.use(verifyAuthorization(["client"]));
clientTicketRoutes.post("/", ticketsController.create);
clientTicketRoutes.get("/me", ticketsController.listByClient);
clientTicketRoutes.get("/:ticketId", ticketsController.getDetailsByClient);

ticketsRoutes.use("/admin", adminTicketRoutes);
ticketsRoutes.use("/technician", technicianTicketRoutes);
ticketsRoutes.use("/client", clientTicketRoutes);

export { ticketsRoutes };
