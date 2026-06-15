import { Role, TicketStatus } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import type { PaginationQueryInput } from "../../shared/pagination.schema";
import { AppError } from "../../utils/AppError";
import type { CreateTicketServiceInput } from "./tickets.schema";

class TicketsService {
	private addTotalPrice<
		Ticket extends { ticketServices: Array<{ price: { toString(): string } }> },
	>(tickets: Ticket[]) {
		return tickets.map((ticket) => {
			const totalPrice = ticket.ticketServices.reduce((acc, ticketService) => {
				return acc + Number(ticketService.price);
			}, 0);

			return { ...ticket, totalPrice };
		});
	}

	async create({ clientId, ...input }: CreateTicketServiceInput) {
		const createdTicket = await prisma.$transaction(async (tx) => {
			const activeServices = await tx.service.findMany({
				where: { id: { in: input.serviceIds }, isActive: true },
			});

			if (activeServices.length !== input.serviceIds.length)
				throw new AppError(404, "Um ou mais servicos nao foram encontrados");

			const availableTechnicians = await tx.user.findMany({
				where: {
					role: Role.technician,
					technicianProfile: { is: { availability: { isEmpty: false } } },
					isActive: true,
				},
				include: {
					technicianTickets: {
						where: {
							status: { in: [TicketStatus.open, TicketStatus.in_progress] },
						},
						select: { id: true },
					},
				},
			});

			const selectedTechnician = availableTechnicians.sort(
				(a, b) => a.technicianTickets.length - b.technicianTickets.length,
			)[0];

			if (!selectedTechnician)
				throw new AppError(409, "Nenhum tecnico disponivel no momento");

			const ticket = await tx.ticket.create({
				data: {
					title: input.title,
					description: input.description,
					clientId: clientId,
					technicianId: selectedTechnician.id,
					ticketServices: {
						create: activeServices.map((service) => {
							return {
								addedById: clientId,
								price: service.price,
								serviceId: service.id,
							};
						}),
					},
				},
				select: {
					id: true,
					title: true,
					description: true,
					status: true,
					technician: { select: { name: true, email: true } },
					client: { select: { name: true, email: true } },
					ticketServices: {
						select: {
							price: true,
							service: {
								select: {
									id: true,
									name: true,
									serviceCategory: true,
								},
							},
						},
					},
				},
			});
			const totalPrice = ticket.ticketServices.reduce((acc, ticketService) => {
				return acc + Number(ticketService.price);
			}, 0);
			return { ...ticket, totalPrice };
		});

		return createdTicket;
	}

	async listByAdmin(query: PaginationQueryInput) {
		const { page, limit } = query;
		const skip = (page - 1) * limit;
		const [tickets, totalItems] = await prisma.$transaction([
			prisma.ticket.findMany({
				skip,
				take: limit,
				select: {
					id: true,
					title: true,
					description: true,
					status: true,
					client: {
						select: {
							name: true,
							clientProfile: { select: { avatarUrl: true } },
						},
					},
					technician: {
						select: {
							name: true,
							technicianProfile: { select: { avatarUrl: true } },
						},
					},
					ticketServices: {
						select: {
							price: true,
							service: { select: { name: true, price: true } },
						},
					},
					updatedAt: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.ticket.count(),
		]);
		const totalPages = Math.ceil(totalItems / limit);
		const ticketsWithTotal = this.addTotalPrice(tickets);
		return {
			data: ticketsWithTotal,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async listByTechnician(userId: string, query: PaginationQueryInput) {
		const { page, limit } = query;
		const skip = (page - 1) * limit;
		const [technicianTickets, totalItems] = await prisma.$transaction([
			prisma.ticket.findMany({
				where: { technicianId: userId },
				skip,
				take: limit,
				select: {
					id: true,
					title: true,
					status: true,
					ticketServices: {
						select: {
							price: true,
							service: { select: { name: true, serviceCategory: true } },
						},
					},
					createdAt: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.ticket.count({ where: { technicianId: userId } }),
		]);
		const totalPages = Math.ceil(totalItems / limit);
		const ticketsWithTotal = this.addTotalPrice(technicianTickets);
		return {
			data: ticketsWithTotal,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async listByClient(userId: string, query: PaginationQueryInput) {
		const { page, limit } = query;
		const skip = (page - 1) * limit;
		const [clientTickets, totalItems] = await prisma.$transaction([
			prisma.ticket.findMany({
				where: { clientId: userId },
				skip,
				take: limit,
				select: {
					id: true,
					title: true,
					status: true,
					ticketServices: {
						select: {
							price: true,
							service: { select: { name: true, serviceCategory: true } },
						},
					},
					createdAt: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.ticket.count({ where: { clientId: userId } }),
		]);
		const totalPages = Math.ceil(totalItems / limit);
		const ticketsWithTotal = this.addTotalPrice(clientTickets);
		return {
			data: ticketsWithTotal,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}
}

export { TicketsService };
