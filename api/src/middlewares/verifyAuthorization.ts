import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
export function verifyAuthorization(roles: string[]) {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (!req.user) throw new AppError(401, "Não Autorizado");
		if (!roles.includes(req.user?.role)) {
			throw new AppError(403, "Não Autorizado");
		}
		next();
	};
}
