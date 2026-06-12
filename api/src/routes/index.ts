import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { clientRoutes } from "../modules/client/client.routes";
import { serviceRoutes } from "../modules/services/services.routes";
import { technicianRoutes } from "../modules/technician/technician.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/technician", technicianRoutes);
routes.use("/client", clientRoutes);
routes.use("/services", serviceRoutes);

export { routes };
