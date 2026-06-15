import type { Request, Response } from "express";
import { paginationQuerySchema } from "../../shared/pagination.schema";
import { AppError } from "../../utils/AppError";
import {
	clientIdParamsSchema,
	updateClientByAdminSchema,
	updateOwnClientProfileSchema,
} from "./client.schema";
import { ClientService } from "./client.service";

const clientService = new ClientService();

class ClientController {
	async list(req: Request, res: Response) {
		const query = paginationQuerySchema.parse(req.query);

		const clients = await clientService.listByAdmin(query);
		return res.status(200).json(clients);
	}

	async updateByAdmin(req: Request, res: Response) {
		const { userId } = clientIdParamsSchema.parse(req.params);
		if (!userId)
			throw new AppError(404, "ID Inválido - Usuário não Encontrado");

		const data = updateClientByAdminSchema.parse(req.body);
		const updatedClient = await clientService.updateByAdmin({
			userId,
			...data,
		});
		res.status(200).json(updatedClient);
	}

	async deleteByAdmin(req: Request, res: Response) {
		const { userId } = clientIdParamsSchema.parse(req.params);
		await clientService.deleteByAdmin(userId);

		res.status(200).json({ message: "Deletado com sucesso" });
	}

	async getOwnProfile(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(403, "Não autorizado");

		const ownProfile = await clientService.getOwnProfile(userId);
		res.status(200).json(ownProfile);
	}

	async updateOwnProfile(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(400, "Não Autorizado");

		const data = updateOwnClientProfileSchema.parse(req.body);
		const updatedOwnClientProfile = await clientService.updateOwnProfile({
			userId,
			...data,
		});

		res.status(200).json(updatedOwnClientProfile);
	}

	async deleteOwnProfile(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(400, "Não Autorizado");

		await clientService.deleteOwnProfile(userId);
		res.status(200).json({ message: "Sua conta foi deletada!" });
	}
}

export { ClientController };
