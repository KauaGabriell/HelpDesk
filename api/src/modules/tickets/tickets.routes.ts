import { Router } from "express";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { verifyAuthorization } from "../../middlewares/verifyAuthorization";
import { TicketsController } from "./tickets.controller";

const ticketsRoutes = Router();
const ticketsController = new TicketsController();

ticketsRoutes.use(verifyAuthentication);
ticketsRoutes.use(verifyAuthorization(["client"]));

ticketsRoutes.post("/", ticketsController.create);

export { ticketsRoutes };
