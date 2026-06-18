import type { Request, Response } from "express";
import { fileSchema } from "./upload.schema";
import { UploadService } from "./upload.service";

const uploadService = new UploadService();

class UploadController {
	async upload(req: Request, res: Response) {
		const file = fileSchema.parse(req.file);
		const fileUploaded = await uploadService.create(file);

		res.status(200).json(fileUploaded);
	}
}

export { UploadController };
