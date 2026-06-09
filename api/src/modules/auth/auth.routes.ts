import { Router } from "express";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { AuthController } from "./auth.controller";

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/login", authController.login);
authRoutes.post("/register", authController.register);

authRoutes.use(verifyAuthentication);
authRoutes.get("/me", authController.getMe);

export { authRoutes };
