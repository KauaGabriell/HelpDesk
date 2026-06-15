import { Role, TicketStatus } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import { AppError } from "../../utils/AppError";
import type { CreateTicketServiceInput } from "./tickets.schema";

class TicketsService {
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
}

export { TicketsService };
