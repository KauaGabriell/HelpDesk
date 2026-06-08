import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/Auth";
import { AppError } from "../utils/AppError";

interface TokenPayload {
	role: string;
	sub: string;
}

export function verifyAuthentication(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	const authorizationHeader = req.headers.authorization;
	if (!authorizationHeader) throw new AppError(401, "TOKEN FALTANTE");

	const [, token] = authorizationHeader.split(" ");
	if (!token) throw new AppError(401, "TOKEN INVÁLIDO");

	try {
		const { role, sub: user_id } = jwt.verify(
			token,
			authConfig.jwt.secret,
		) as TokenPayload;
		req.user = { id: user_id, role };
	} catch (_error) {
		throw new AppError(401, "TOKEN INVÁLIDO");
	}

	next();
}
