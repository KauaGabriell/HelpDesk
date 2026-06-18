import { z } from "zod";
import uploadConfig from "../../config/upload";

export const fileSchema = z
	.object({
		filename: z.string().trim().min(1, "Insira um arquivo"),
		mimetype: z
			.string()
			.refine(
				(type) => uploadConfig.ACCEPTED_FILE_TYPES.includes(type),
				`Formato Inválido - Formatos permitidos: ${uploadConfig.ACCEPTED_FILE_TYPES}`,
			),
		size: z
			.number()
			.positive()
			.refine(
				(size) => size <= uploadConfig.MAX_SIZE_FILE,
				`Tamanho máximo permitido ${uploadConfig.MAX_MB}MB`,
			),
	})
	.loose();

export type FileServiceInput = z.infer<typeof fileSchema>;
