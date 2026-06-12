import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import {
	createServiceSchema,
	listServicesQuerySchema,
	updateServiceParamsSchema,
	updateServiceSchema,
	updateStatusServiceSchema,
} from "./services.schema";
import { ServicesService } from "./services.service";

const servicesService = new ServicesService();

class ServiceController {
	async createByAdmin(req: Request, res: Response) {
		const input = createServiceSchema.parse(req.body);

		const service = await servicesService.createByAdmin(input);
		res.status(201).json(service);
	}

	async listServicesByAdmin(req: Request, res: Response) {
		const query = listServicesQuerySchema.parse(req.query);

		const services = await servicesService.listServicesByAdmin(query);
		res.status(200).json(services);
	}
	async updateServiceByAdmin(req: Request, res: Response) {
		const changedById = req.user?.id;
		if (!changedById) throw new AppError(400, "Não Autorizado");

		const { serviceId } = updateServiceParamsSchema.parse(req.params);
		if (!serviceId) throw new AppError(400, "Não Autorizado");

		const input = updateServiceSchema.parse(req.body);

		const updatedService = await servicesService.updateServiceByAdmin({
			serviceId,
			changedById,
			...input,
		});

		res.status(200).json(updatedService);
	}
	async updateStatusServiceByAdmin(req: Request, res: Response) {
		const { serviceId } = updateServiceParamsSchema.parse(req.params);
		if (!serviceId) throw new AppError(400, "Não Autorizado");

		const input = updateStatusServiceSchema.parse(req.body);

		const updatedStatusService =
			await servicesService.updateStatusServiceByAdmin({
				serviceId,
				...input,
			});
		return res.status(200).json(updatedStatusService);
	}
}

export { ServiceController };
