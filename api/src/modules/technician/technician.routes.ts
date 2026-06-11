import { Router } from "express";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { verifyAuthorization } from "../../middlewares/verifyAuthorization";
import { verifyMustChangePassword } from "../../middlewares/verifyMustChangePassword";
import { TechnicianController } from "./technician.controller";

const technicianRoutes = Router();
const technicianController = new TechnicianController();
const ownTechnicianRoutes = Router();
const adminTechnicianRoutes = Router();

technicianRoutes.use(verifyAuthentication);

ownTechnicianRoutes.use(verifyAuthorization(["technician"]));
ownTechnicianRoutes.patch("/password", technicianController.changePassword);
ownTechnicianRoutes.get("/", technicianController.showOwnProfile);

ownTechnicianRoutes.use(verifyMustChangePassword);
ownTechnicianRoutes.patch("/", technicianController.updateOwnTechnicianProfile);

adminTechnicianRoutes.use(verifyAuthorization(["admin"]));
adminTechnicianRoutes.post("/", technicianController.create);
adminTechnicianRoutes.get("/", technicianController.index);
adminTechnicianRoutes.patch("/:id", technicianController.update);

technicianRoutes.use("/me", ownTechnicianRoutes);
technicianRoutes.use("/", adminTechnicianRoutes);

export { technicianRoutes };
