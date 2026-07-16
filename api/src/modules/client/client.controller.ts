import type { Request, Response } from "express";
import { paginationQuerySchema } from "../../shared/pagination.schema";
import { AppError } from "../../utils/AppError";
import { fileSchema } from "../upload/upload.schema";
import {
	changeClientPasswordSchema,
	clientIdParamsSchema,
	updateClientByAdminSchema,
	updateOwnClientProfileSchema,
} from "./client.schema";
import { ClientService } from "./client.service";

const clientService = new ClientService();

class ClientController {
	async changeOwnPassword(req: Request, res: Response) {
		const userId = req.user?.id;
		if (!userId) throw new AppError(401, "Não autorizado");

		const input = changeClientPasswordSchema.parse(req.body);
		const updatedClient = await clientService.changeOwnPassword({
			userId,
			...input,
		});
		res.status(200).json(updatedClient);
	}

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

	async updateOwnAvatar(req: Request, res: Response) {
		const clientId = req.user?.id;
		if (!clientId) throw new AppError(403, "Não autorizado");

		const file = fileSchema.parse(req.file);
		const updatedClientAvatar = await clientService.updateOwnAvatar({
			clientId,
			file,
		});
		res.status(200).json(updatedClientAvatar);
	}
}

export { ClientController };
