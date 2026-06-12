import { Router } from "express";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { verifyAuthorization } from "../../middlewares/verifyAuthorization";
import { ClientController } from "./client.controller";

const clientRoutes = Router();
const ownClientRoutes = Router();
const adminClientRoutes = Router();

const clientController = new ClientController();

clientRoutes.use(verifyAuthentication);

adminClientRoutes.use(verifyAuthorization(["admin"]));
adminClientRoutes.get("/", clientController.list);
adminClientRoutes.patch("/:userId", clientController.updateByAdmin);
adminClientRoutes.delete("/:userId", clientController.deleteByAdmin);

ownClientRoutes.use(verifyAuthorization(["client"]));
ownClientRoutes.get("/", clientController.getOwnProfile);
ownClientRoutes.patch("/", clientController.updateOwnProfile);
ownClientRoutes.delete("/", clientController.deleteOwnProfile);

clientRoutes.use("/me", ownClientRoutes);
clientRoutes.use("/", adminClientRoutes);

export { clientRoutes };
