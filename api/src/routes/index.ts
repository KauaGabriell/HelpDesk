import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { technicianRoutes } from "../modules/technician/technician.routes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/technician", technicianRoutes);

export { routes };
