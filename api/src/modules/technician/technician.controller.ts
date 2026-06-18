import type { Request, Response } from "express";
import { paginationQuerySchema } from "../../shared/pagination.schema";
import { AppError } from "../../utils/AppError";
import { fileSchema } from "../upload/upload.schema";
import {
	changeTechnicianPasswordSchema,
	createTechnicianSchema,
	technicianIdParamsSchema,
	updateOwnTechnicianProfileSchema,
	updateTechnicianByAdminSchema,
} from "./technician.schema";
import { TechnicianService } from "./technician.service";

const technicianService = new TechnicianService();

class TechnicianController {
	async create(req: Request, res: Response) {
		const input = createTechnicianSchema.parse(req.body);
		const result = await technicianService.create(input);

		return res.status(201).json(result);
	}

	async list(req: Request, res: Response) {
		const query = paginationQuerySchema.parse(req.query);

		const technicians = await technicianService.list(query);
		return res.status(200).json(technicians);
	}

	async getOwnProfile(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(401, "Não autorizado");

		const result = await technicianService.getOwnProfile(userId);
		return res.status(200).json(result);
	}

	async updateByAdmin(req: Request, res: Response) {
		const { id } = technicianIdParamsSchema.parse(req.params);

		const input = updateTechnicianByAdminSchema.parse(req.body);
		const result = await technicianService.updateByAdmin({ id, ...input });

		return res.status(200).json(result);
	}

	async deleteByAdmin(req: Request, res: Response) {
		const { id } = technicianIdParamsSchema.parse(req.params);

		const result = await technicianService.deleteByAdmin(id);

		return res.status(200).json(result);
	}

	async updateOwnProfile(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(400, "Não Autorizado");
		const input = updateOwnTechnicianProfileSchema.parse(req.body);

		const result = await technicianService.updateOwnProfile({
			userId,
			...input,
		});

		return res.status(200).json(result);
	}

	async changeOwnPassword(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(401, "Usuário Não Encontrado");

		const input = changeTechnicianPasswordSchema.parse(req.body);

		const result = await technicianService.changeOwnPassword({
			userId,
			...input,
		});
		return res.status(200).json(result);
	}
	async updateOwnAvatar(req: Request, res: Response) {
		const technicianId = req.user?.id;
		if (!technicianId) throw new AppError(403, "Não autorizado");

		const file = fileSchema.parse(req.file);
		const updatedTechnicianAvatar = await technicianService.updateOwnAvatar({
			technicianId,
			file,
		});
		res.status(200).json(updatedTechnicianAvatar);
	}
}

export { TechnicianController };
