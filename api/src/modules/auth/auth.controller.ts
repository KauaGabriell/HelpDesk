import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { loginSchema, registerSchema } from "./auth.schema";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
	async register(req: Request, res: Response) {
		const data = registerSchema.parse(req.body);

		const result = await authService.register(data);
		return res.status(200).json(result);
	}
	async login(req: Request, res: Response) {
		const data = loginSchema.parse(req.body);

		const result = await authService.login(data);
		return res.status(200).json(result);
	}
	async getMe(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(401, "Usuário Não Encontrado");

		const user = await authService.getMe(userId);
		res.status(200).json(user);
	}
}
