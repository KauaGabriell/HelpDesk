import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import {
	changePasswordSchema,
	technicianParamsSchema,
	technicianSchema,
	updateOwnTechnicianSchema,
	updateTechnicianSchema,
} from "./technician.schema";
import { TechnicianService } from "./technician.service";

const technicianService = new TechnicianService();

class TechnicianController {
	async create(req: Request, res: Response) {
		const data = technicianSchema.parse(req.body);
		const result = await technicianService.create(data);

		return res.status(201).json(result);
	}

	async index(_req: Request, res: Response) {
		const technicians = await technicianService.index();
		return res.status(200).json(technicians);
	}

	async showOwnProfile(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(401, "Não autorizado");

		const result = await technicianService.showOwnProfile(userId);
		return res.status(200).json(result);
	}

	async update(req: Request, res: Response) {
		const { id } = technicianParamsSchema.parse(req.params);

		const data = updateTechnicianSchema.parse(req.body);
		const result = await technicianService.update({ id, ...data });

		return res.status(200).json(result);
	}

	async updateOwnTechnicianProfile(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(400, "Não Autorizado");
		const data = updateOwnTechnicianSchema.parse(req.body);

		const result = await technicianService.updateOwnTechnicianProfile({
			userId,
			...data,
		});

		return res.status(200).json(result);
	}

	async changePassword(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(401, "Usuário Não Encontrado");

		const data = changePasswordSchema.parse(req.body);

		const result = await technicianService.changePassword({ userId, ...data });
		return res.status(200).json(result);
	}
}

export { TechnicianController };
