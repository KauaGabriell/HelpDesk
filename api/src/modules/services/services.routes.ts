import { Router } from "express";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { verifyAuthorization } from "../../middlewares/verifyAuthorization";
import { ServiceController } from "./services.controller";

const serviceRoutes = Router();
const serviceController = new ServiceController();

serviceRoutes.use(verifyAuthentication);

serviceRoutes.get(
	"/active",
	verifyAuthorization(["client"]),
	serviceController.listActiveForClient,
);

serviceRoutes.use(verifyAuthorization(["admin"]));

serviceRoutes.post("/", serviceController.createByAdmin);
serviceRoutes.get("/", serviceController.listServicesByAdmin);
serviceRoutes.patch("/:serviceId", serviceController.updateServiceByAdmin);
serviceRoutes.patch(
	"/:serviceId/status",
	serviceController.updateStatusServiceByAdmin,
);

export { serviceRoutes };
