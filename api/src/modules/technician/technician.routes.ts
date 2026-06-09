import { Router } from "express";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { verifyAuthorization } from "../../middlewares/verifyAuthorization";
import { TechnicianController } from "./technician.controller";

const technicianRoutes = Router();
const technicianController = new TechnicianController();

technicianRoutes.use(verifyAuthentication);

technicianRoutes.patch(
	"/me/password",
	verifyAuthorization(["technician"]),
	technicianController.changePassword,
);

technicianRoutes.use(verifyAuthorization(["admin"]));

technicianRoutes.post("/", technicianController.create);
technicianRoutes.get("/", technicianController.index);
technicianRoutes.patch("/:id", technicianController.update);

export { technicianRoutes };
