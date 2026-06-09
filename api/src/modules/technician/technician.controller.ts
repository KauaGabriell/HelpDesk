import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { changePasswordSchema } from "./technician.schema";
import { TechnicianService } from "./technician.service";

const technicianService = new TechnicianService();

class TechnicianController {
	async changePassword(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(401, "Usuário Não Encontrado");

		const data = changePasswordSchema.parse(req.body);

		const result = await technicianService.changePassword({ userId, ...data });
		return res.status(200).json(result);
	}
}

export { TechnicianController };
