import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { diskStorage, type Options } from "multer";
import { AppError } from "../utils/AppError";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_FOLDER = path.resolve(__dirname, "..", "..", "tmp");
const UPLOADS_FOLDER = path.resolve(__dirname, "..", "..", "uploads");
const UPLOADS_URL = "/uploads";

const MAX_MB = 3;
const MAX_SIZE_FILE = 1024 * 1024 * MAX_MB;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

fs.mkdirSync(TMP_FOLDER, { recursive: true });
fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });

const MULTER: Options = {
	storage: diskStorage({
		destination: TMP_FOLDER,
		filename(_req, file, callback) {
			const fileHash = crypto.randomBytes(10).toString("hex");
			const fileName = `${fileHash}-${file.originalname}`;

			return callback(null, fileName);
		},
	}),
	limits: { fileSize: MAX_SIZE_FILE },
	fileFilter(_req, file, callback) {
		if (!ACCEPTED_FILE_TYPES.includes(file.mimetype)) {
			return callback(
				new AppError(400, "Formato inválido") as unknown as Error,
			);
		}

		return callback(null, true);
	},
};

export default {
	ACCEPTED_FILE_TYPES,
	MAX_MB,
	MAX_SIZE_FILE,
	MULTER,
	TMP_FOLDER,
	UPLOADS_FOLDER,
	UPLOADS_URL,
};
