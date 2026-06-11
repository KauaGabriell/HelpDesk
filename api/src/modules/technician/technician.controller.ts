import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
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

	async list(_req: Request, res: Response) {
		const technicians = await technicianService.list();
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
}

export { TechnicianController };
