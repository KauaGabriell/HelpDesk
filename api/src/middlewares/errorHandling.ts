import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import { AppError } from "../utils/AppError";

export function errorHandling(
	// biome-ignore lint/suspicious/noExplicitAny: <Error type>
	error: any,
	_request: Request,
	response: Response,
	_next: NextFunction,
) {
	if (error instanceof AppError)
		return response.status(error.statusCode).json({ message: error.message });

	if (error instanceof ZodError)
		return response.status(400).json({ message: z.treeifyError(error) });

	if (error instanceof PrismaClientKnownRequestError && error.code === "P2002")
		return response.status(400).json({ message: "Recurso já existente" });

	return response.status(500).json({ message: "Erro Interno do Servidor" });
}
