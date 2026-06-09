import { Router } from "express";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { verifyAuthorization } from "../../middlewares/verifyAuthorization";
import { AuthController } from "./auth.controller";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/login", authController.login);

authRoutes.use(verifyAuthentication);
authRoutes.use(verifyAuthorization(["client"]));
authRoutes.post("/register", authController.register);

export { authRoutes };
