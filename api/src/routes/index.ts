import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { clientRoutes } from "../modules/client/client.routes";
import { serviceRoutes } from "../modules/services/services.routes";
import { technicianRoutes } from "../modules/technician/technician.routes";
import { ticketsRoutes } from "../modules/tickets/tickets.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/technician", technicianRoutes);
routes.use("/client", clientRoutes);
routes.use("/services", serviceRoutes);
routes.use("/tickets", ticketsRoutes);

export { routes };
