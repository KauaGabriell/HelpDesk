import { Role, TicketStatus } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import type { PaginationQueryInput } from "../../shared/pagination.schema";
import { AppError } from "../../utils/AppError";
import type {
	ChangeTicketStatusByAdminServiceInput,
	CreateTicketServiceInput,
	TechnicianTicketActionServiceInput,
} from "./tickets.schema";

class TicketsService {
	private calculateTotalPrice(
		ticketServices: Array<{ price: { toString(): string } }>,
	) {
		return ticketServices.reduce((acc, ticketService) => {
			return acc + Number(ticketService.price);
		}, 0);
	}

	private addTotalPrice<
		Ticket extends { ticketServices: Array<{ price: { toString(): string } }> },
	>(tickets: Ticket[]) {
		return tickets.map((ticket) => {
			const totalPrice = this.calculateTotalPrice(ticket.ticketServices);

			return { ...ticket, totalPrice };
		});
	}

	private transitionRules: Record<
		TicketStatus,
		{ allowed: TicketStatus[]; errorMessage: string }
	> = {
		[TicketStatus.open]: {
			allowed: [TicketStatus.in_progress],
			errorMessage: "Chamado aberto so pode ser alterado para atendimento",
		},
		[TicketStatus.in_progress]: {
			allowed: [TicketStatus.closed],
			errorMessage: "Chamado em atendimento só pode ser encerrado",
		},
		[TicketStatus.closed]: {
			allowed: [],
			errorMessage: "Chamado encerrado não pode ser alterado",
		},
	};

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
			const totalPrice = this.calculateTotalPrice(ticket.ticketServices);
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
	async getDetailsByClient(clientId: string, ticketId: string) {
		const ticketDetails = await prisma.ticket.findFirst({
			where: {
				clientId: clientId,
				client: { role: Role.client },
				id: ticketId,
			},
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				ticketServices: {
					select: {
						price: true,
						service: {
							select: { id: true, name: true, serviceCategory: true },
						},
					},
				},
				createdAt: true,
				updatedAt: true,
				technician: {
					select: {
						name: true,
						email: true,
						technicianProfile: { select: { avatarUrl: true } },
					},
				},
			},
		});
		if (!ticketDetails) throw new AppError(404, "Chamado não encontrado");
		const totalPrice = this.calculateTotalPrice(ticketDetails.ticketServices);
		return { ...ticketDetails, totalPrice };
	}
	async getDetailsByTechnician(technicianId: string, ticketId: string) {
		const ticketDetails = await prisma.ticket.findFirst({
			where: {
				technicianId: technicianId,
				technician: { role: Role.technician },
				id: ticketId,
			},
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				ticketServices: {
					select: {
						price: true,
						service: {
							select: { id: true, name: true, serviceCategory: true },
						},
					},
				},
				createdAt: true,
				updatedAt: true,
				client: {
					select: {
						name: true,
						clientProfile: { select: { avatarUrl: true } },
					},
				},
				technician: {
					select: {
						name: true,
						email: true,
						technicianProfile: { select: { avatarUrl: true } },
					},
				},
			},
		});
		if (!ticketDetails) throw new AppError(404, "Chamado não encontrado");
		const totalPrice = this.calculateTotalPrice(ticketDetails.ticketServices);
		return { ...ticketDetails, totalPrice };
	}
	async getDetailsByAdmin(ticketId: string) {
		const ticketDetails = await prisma.ticket.findUnique({
			where: {
				id: ticketId,
			},
			select: {
				id: true,
				title: true,
				description: true,
				status: true,
				ticketServices: {
					select: {
						price: true,
						service: {
							select: { id: true, name: true, serviceCategory: true },
						},
					},
				},
				createdAt: true,
				updatedAt: true,
				client: {
					select: {
						name: true,
						clientProfile: { select: { avatarUrl: true } },
					},
				},
				technician: {
					select: {
						name: true,
						email: true,
						technicianProfile: { select: { avatarUrl: true } },
					},
				},
			},
		});
		if (!ticketDetails) throw new AppError(404, "Chamado não encontrado");
		const totalPrice = this.calculateTotalPrice(ticketDetails.ticketServices);
		return { ...ticketDetails, totalPrice };
	}
	async changeTicketStatusByAdmin({
		ticketId,
		...data
	}: ChangeTicketStatusByAdminServiceInput) {
		const updatedTicket = await prisma.$transaction(async (prisma) => {
			const ticket = await prisma.ticket.findUnique({
				where: { id: ticketId },
			});

			if (!ticket) throw new AppError(404, "Chamado não encontrado");

			const nextStatus = this.transitionRules[ticket.status];

			if (!nextStatus.allowed.includes(data.status))
				throw new AppError(400, nextStatus.errorMessage);

			const updatedTicketStatus = await prisma.ticket.update({
				where: { id: ticketId },
				data: {
					status: data.status,
				},
			});
			return updatedTicketStatus;
		});
		return updatedTicket;
	}
	async startTicketByTechnician({
		technicianId,
		ticketId,
	}: TechnicianTicketActionServiceInput) {
		const startedTicket = await prisma.$transaction(async (prisma) => {
			const ticket = await prisma.ticket.findUnique({
				where: { id: ticketId, technicianId: technicianId },
			});
			if (!ticket) throw new AppError(404, "Chamado não encontrado");

			if (ticket.status !== TicketStatus.open)
				throw new AppError(
					400,
					"Não foi possível iniciar o atendimento. Selecione um chamado aberto",
				);

			const startedTicket = await prisma.ticket.update({
				where: { id: ticketId },
				data: {
					status: TicketStatus.in_progress,
				},
			});
			return startedTicket;
		});
		return startedTicket;
	}
	async closeTicketByTechnician({
		technicianId,
		ticketId,
	}: TechnicianTicketActionServiceInput) {
		const closedTicket = await prisma.$transaction(async (prisma) => {
			const ticket = await prisma.ticket.findUnique({
				where: { id: ticketId, technicianId: technicianId },
			});
			if (!ticket) throw new AppError(404, "Chamado nÃ£o encontrado");

			if (ticket.status === TicketStatus.open) {
				throw new AppError(
					400,
					"Inicie o atendimento antes de encerrar o chamado",
				);
			}

			if (ticket.status === TicketStatus.closed) {
				throw new AppError(
					400,
					this.transitionRules[TicketStatus.closed].errorMessage,
				);
			}

			const closedTicket = await prisma.ticket.update({
				where: { id: ticketId },
				data: {
					status: TicketStatus.closed,
				},
			});
			return closedTicket;
		});
		return closedTicket;
	}
}

export { TicketsService };
