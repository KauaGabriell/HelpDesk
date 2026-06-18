import { Router } from "express";
import multer from "multer";
import uploadConfig from "../../config/upload";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { verifyAuthorization } from "../../middlewares/verifyAuthorization";
import { verifyMustChangePassword } from "../../middlewares/verifyMustChangePassword";
import { TechnicianController } from "./technician.controller";

const technicianRoutes = Router();
const technicianController = new TechnicianController();
const ownTechnicianRoutes = Router();
const adminTechnicianRoutes = Router();
const upload = multer(uploadConfig.MULTER);

technicianRoutes.use(verifyAuthentication);

ownTechnicianRoutes.use(verifyAuthorization(["technician"]));
ownTechnicianRoutes.patch("/password", technicianController.changeOwnPassword);
ownTechnicianRoutes.get("/", technicianController.getOwnProfile);
ownTechnicianRoutes.patch(
	"/avatar",
	upload.single("avatar"),
	technicianController.updateOwnAvatar,
);

ownTechnicianRoutes.use(verifyMustChangePassword);
ownTechnicianRoutes.patch("/", technicianController.updateOwnProfile);

adminTechnicianRoutes.use(verifyAuthorization(["admin"]));
adminTechnicianRoutes.post("/", technicianController.create);
adminTechnicianRoutes.get("/", technicianController.list);
adminTechnicianRoutes.patch("/:id", technicianController.updateByAdmin);
adminTechnicianRoutes.delete("/:id", technicianController.deleteByAdmin);

technicianRoutes.use("/me", ownTechnicianRoutes);
technicianRoutes.use("/", adminTechnicianRoutes);

export { technicianRoutes };
