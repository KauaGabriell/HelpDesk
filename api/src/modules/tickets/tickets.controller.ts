import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { createTicketSchema } from "./tickets.schema";
import { TicketsService } from "./tickets.service";

const ticketsService = new TicketsService();

class TicketsController {
	async create(req: Request, res: Response) {
		const clientId = req.user?.id;
		if (!clientId) throw new AppError(403, "Nao autorizado");

		const input = createTicketSchema.parse(req.body);

		const ticket = await ticketsService.create({ clientId, ...input });
		res.status(201).json(ticket);
	}
}

export { TicketsController };
