import type { NextFunction, Request, Response } from "express";
import { prisma } from "../libs/prisma";
import { AppError } from "../utils/AppError";

export async function verifyMustChangePassword(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	if (!req.user) throw new AppError(401, "Usuário não Autenticado");
	const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
	if (!user) throw new AppError(401, "Usuário não encontrado");

	if (user?.mustChangePassword === true)
		throw new AppError(
			403,
			"Altere sua senha para acessar esta funcionalidade.",
		);
	next();
}
