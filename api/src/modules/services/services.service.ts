import { prisma } from "../../libs/prisma";
import { AppError } from "../../utils/AppError";
import type {
	createServiceInput,
	listServicesByAdminInput,
	updateServiceInputWithId,
	updateStatusServiceInputWithId,
} from "./services.schema";

class ServicesService {
	async createByAdmin(input: createServiceInput) {
		const service = await prisma.service.create({
			data: {
				name: input.name,
				price: input.price,
				serviceCategory: input.category,
			},
		});

		return service;
	}

	async listServicesByAdmin({ isActive }: listServicesByAdminInput) {
		const activeServices = await prisma.service.findMany({
			where: { isActive },
		});
		return activeServices;
	}

	async updateServiceByAdmin({
		serviceId,
		changedById,
		...input
	}: updateServiceInputWithId) {
		const updatedService = await prisma.$transaction(async (tx) => {
			const service = await tx.service.findUnique({
				where: { id: serviceId },
			});
			if (!service) throw new AppError(404, "Serviço não encontrado");

			const updatedService = await tx.service.update({
				where: {
					id: serviceId,
				},
				data: {
					name: input.name,
					price: input.price,
					serviceCategory: input.category,
				},
			});

			if (input.price !== undefined && !input.price.equals(service.price)) {
				await tx.servicePriceLog.create({
					data: {
						oldPrice: service.price,
						newPrice: input.price,
						changedById: changedById,
						serviceId: serviceId,
					},
				});
			}
			return updatedService;
		});

		return updatedService;
	}

	async updateStatusServiceByAdmin({
		serviceId,
		...input
	}: updateStatusServiceInputWithId) {
		const updatedStatusService = await prisma.service.update({
			where: { id: serviceId },
			data: {
				isActive: input.isActive,
			},
		});
		return updatedStatusService;
	}
}

export { ServicesService };
