import {
	Role,
	ServiceCategory,
	TicketStatus,
} from "../../src/generated/prisma/enums";
import { prisma } from "../../src/libs/prisma";
import { type CreateTestUserInput, createTestUser } from "./auth";

export function createTestAdmin(input: Omit<CreateTestUserInput, "role"> = {}) {
	return createTestUser({ ...input, role: Role.admin });
}

export function createTestClient(
	input: Omit<CreateTestUserInput, "role"> = {},
) {
	return createTestUser({ ...input, role: Role.client });
}

export function createTestTechnician(
	input: Omit<CreateTestUserInput, "role" | "availability"> & {
		availability?: string[];
	} = {},
) {
	return createTestUser({
		...input,
		role: Role.technician,
		availability: input.availability ?? ["09:00"],
	});
}

type CreateTestServiceInput = {
	name?: string;
	price?: number;
	category?: ServiceCategory;
	isActive?: boolean;
};

export async function createTestService({
	name = `Service ${crypto.randomUUID()}`,
	price = 100,
	category = ServiceCategory.support,
	isActive = true,
}: CreateTestServiceInput = {}) {
	return prisma.service.create({
		data: {
			name,
			price,
			serviceCategory: category,
			isActive,
		},
	});
}

type CreateTestTicketInput = {
	clientId: string;
	technicianId: string;
	serviceIds: string[];
	title?: string;
	description?: string;
	status?: TicketStatus;
};

export async function createTestTicket({
	clientId,
	technicianId,
	serviceIds,
	title = "Test ticket",
	description = "Test description",
	status = TicketStatus.open,
}: CreateTestTicketInput) {
	const services = await prisma.service.findMany({
		where: { id: { in: serviceIds } },
	});

	if (services.length !== serviceIds.length) {
		throw new Error("Every test ticket service must exist.");
	}

	return prisma.ticket.create({
		data: {
			title,
			description,
			status,
			clientId,
			technicianId,
			ticketServices: {
				create: services.map((service) => ({
					serviceId: service.id,
					price: service.price,
					addedById: clientId,
				})),
			},
		},
		include: { ticketServices: true },
	});
}
