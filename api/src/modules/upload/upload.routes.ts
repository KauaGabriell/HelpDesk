import { Router } from "express";
import multer from "multer";
import uploadConfig from "../../config/upload";
import { verifyAuthentication } from "../../middlewares/verifyAuthentication";
import { UploadController } from "./upload.controller";

const uploadRoutes = Router();
const uploadController = new UploadController();
const upload = multer(uploadConfig.MULTER);

uploadRoutes.use(verifyAuthentication);
uploadRoutes.post("/", upload.single("avatar"), uploadController.upload);

export { uploadRoutes };
