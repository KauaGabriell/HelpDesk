import fs from "node:fs";
import path from "node:path";
import uploadConfig from "../../config/upload";
import { AppError } from "../../utils/AppError";
import type { FileServiceInput } from "./upload.schema";

class UploadService {
	async create(file: FileServiceInput) {
		const fileSaved = await this.saveFile(file.filename);
		return { avatarUrl: fileSaved };
	}

	async saveFile(file: string) {
		const tmpPath = path.resolve(uploadConfig.TMP_FOLDER, file);
		const destPath = path.resolve(uploadConfig.UPLOADS_FOLDER, file);
		const url = `${uploadConfig.UPLOADS_URL}/${file}`;

		try {
			await fs.promises.access(tmpPath);
		} catch {
			throw new AppError(404, "Arquivo não encontrado");
		}
		await fs.promises.mkdir(uploadConfig.UPLOADS_FOLDER, { recursive: true });
		await fs.promises.rename(tmpPath, destPath);
		return url;
	}

	async deleteFile(file: string, type: "tmp" | "upload") {
		const pathFile =
			type === "tmp" ? uploadConfig.TMP_FOLDER : uploadConfig.UPLOADS_FOLDER;
		const filePath = path.resolve(pathFile, file);

		try {
			await fs.promises.stat(filePath);
		} catch {
			return;
		}
		await fs.promises.unlink(filePath);
	}
}

export { UploadService };
