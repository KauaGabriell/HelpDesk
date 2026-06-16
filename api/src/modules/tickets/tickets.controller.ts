import type { Request, Response } from "express";
import { paginationQuerySchema } from "../../shared/pagination.schema";
import { AppError } from "../../utils/AppError";
import {
	changeTicketStatusSchema,
	createTicketSchema,
	ticketIdParamsSchema,
} from "./tickets.schema";
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

	async listByAdmin(req: Request, res: Response) {
		const query = paginationQuerySchema.parse(req.query);

		const tickets = await ticketsService.listByAdmin(query);
		res.status(200).json(tickets);
	}

	async listByTechnician(req: Request, res: Response) {
		const query = paginationQuerySchema.parse(req.query);
		const userId = req.user?.id;

		if (!userId) throw new AppError(403, "Nao autorizado");

		const technicianTickets = await ticketsService.listByTechnician(
			userId,
			query,
		);
		res.status(200).json(technicianTickets);
	}

	async listByClient(req: Request, res: Response) {
		const query = paginationQuerySchema.parse(req.query);
		const userId = req.user?.id;

		if (!userId) throw new AppError(403, "Nao autorizado");

		const clientTickets = await ticketsService.listByClient(userId, query);
		res.status(200).json(clientTickets);
	}

	async getDetailsByClient(req: Request, res: Response) {
		const clientId = req.user?.id;
		if (!clientId) throw new AppError(403, "Nao autorizado");

		const { ticketId } = ticketIdParamsSchema.parse(req.params);

		const ticketDetails = await ticketsService.getDetailsByClient(
			clientId,
			ticketId,
		);

		res.status(200).json(ticketDetails);
	}

	async getDetailsByTechnician(req: Request, res: Response) {
		const technicianId = req.user?.id;
		if (!technicianId) throw new AppError(403, "Nao autorizado");

		const { ticketId } = ticketIdParamsSchema.parse(req.params);

		const ticketDetails = await ticketsService.getDetailsByTechnician(
			technicianId,
			ticketId,
		);

		res.status(200).json(ticketDetails);
	}

	async getDetailsByAdmin(req: Request, res: Response) {
		const adminId = req.user?.id;
		if (!adminId || req.user?.role !== "admin") {
			throw new AppError(403, "Nao autorizado");
		}

		const { ticketId } = ticketIdParamsSchema.parse(req.params);

		const ticketDetails = await ticketsService.getDetailsByAdmin(ticketId);

		res.status(200).json(ticketDetails);
	}
	async changeTicketStatusByAdmin(req: Request, res: Response) {
		const { ticketId } = ticketIdParamsSchema.parse(req.params);
		const { status } = changeTicketStatusSchema.parse(req.body);

		if (req.user?.role !== "admin") throw new AppError(403, "Não autorizado");
		const updatedTicket = await ticketsService.changeTicketStatusByAdmin({
			ticketId,
			status,
		});
		res.status(200).json(updatedTicket);
	}
	async startTicketByTechnician(req: Request, res: Response) {
		const { ticketId } = ticketIdParamsSchema.parse(req.params);

		const technicianId = req.user?.id;
		if (!technicianId) throw new AppError(403, "Nao autorizado");

		const startedTicket = await ticketsService.startTicketByTechnician({
			technicianId,
			ticketId,
		});
		res.status(200).json(startedTicket);
	}
}

export { TicketsController };
