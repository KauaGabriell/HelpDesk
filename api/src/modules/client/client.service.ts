import { Role } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import type { PaginationQueryInput } from "../../shared/pagination.schema";
import { AppError } from "../../utils/AppError";
import { toPublicUser } from "../auth/auth.mappers";
import type { FileServiceInput } from "../upload/upload.schema";
import { UploadService } from "../upload/upload.service";
import { toPublicClient } from "./client.mappers";
import type {
	UpdateClientByAdminServiceInput,
	UpdateOwnClientProfileServiceInput,
} from "./client.schema";

const uploadService = new UploadService();

type UpdateClientAvatarServiceInput = {
	clientId: string;
	file: FileServiceInput;
};

class ClientService {
	async listByAdmin(query: PaginationQueryInput) {
		const { page, limit } = query;
		const skip = (page - 1) * limit;

		const [clients, totalItems] = await prisma.$transaction([
			prisma.user.findMany({
				skip,
				take: limit,
				where: { role: Role.client },
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					isActive: true,
					clientProfile: {
						select: {
							id: true,
							userId: true,
							avatarUrl: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),

			prisma.user.count({ where: { role: Role.client } }),
		]);
		const totalPages = Math.ceil(totalItems / limit);
		return {
			data: clients,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async updateByAdmin({ userId, ...data }: UpdateClientByAdminServiceInput) {
		if (data.email) {
			const emailOwner = await prisma.user.findUnique({
				where: { email: data.email },
				select: { id: true },
			});
			if (emailOwner && emailOwner.id !== userId)
				throw new AppError(400, "E-mail já cadastrado");
		}

		const updatedClient = await prisma.user.update({
			where: { id: userId, role: Role.client },
			data: {
				name: data.name,
				email: data.email,
			},
		});
		if (!updatedClient) throw new AppError(401, "Não foi possível atualizar");

		return toPublicClient(updatedClient);
	}

	async deleteByAdmin(userId: string) {
		const deletedUser = await prisma.user.delete({
			where: { id: userId, role: Role.client },
		});

		return toPublicUser(deletedUser);
	}

	async getOwnProfile(userId: string) {
		const clientOwnProfile = await prisma.user.findFirst({
			where: { id: userId, role: Role.client },
			select: {
				id: true,
				name: true,
				email: true,
				clientProfile: { select: { avatarUrl: true } },
			},
		});

		return clientOwnProfile;
	}

	async updateOwnProfile({
		userId,
		...data
	}: UpdateOwnClientProfileServiceInput) {
		const userUpdateData = {
			name: data.name,
			email: data.email,
		};
		const profileUpdateData = {
			avatarUrl: data.avatarUrl,
		};
		const updatedOwnProfile = await prisma.$transaction(async (prisma) => {
			const authenticatedClient = await prisma.user.findFirst({
				where: { id: userId, role: Role.client },
				select: {
					id: true,
					clientProfile: {
						select: {
							id: true,
						},
					},
				},
			});
			if (!authenticatedClient) throw new AppError(403, "Não autorizado");
			if (!authenticatedClient.clientProfile)
				throw new AppError(404, "Perfil de cliente não encontrado");

			if (data.email) {
				const emailOwner = await prisma.user.findUnique({
					where: { email: userUpdateData.email },
					select: {
						id: true,
					},
				});
				if (emailOwner && emailOwner.id !== userId)
					throw new AppError(400, "E-mail já cadastrado");
			}

			const updatedOwnUser = await prisma.user.update({
				where: { id: userId, role: Role.client },
				data: {
					name: userUpdateData.name,
					email: userUpdateData.email,
				},
				select: {
					id: true,
					name: true,
					email: true,
				},
			});

			const updatedClientProfile = await prisma.clientProfile.update({
				where: { userId },
				data: {
					avatarUrl: profileUpdateData.avatarUrl,
				},
				select: {
					id: true,
					avatarUrl: true,
				},
			});

			return { user: updatedOwnUser, profile: updatedClientProfile };
		});
		return updatedOwnProfile;
	}

	async deleteOwnProfile(userId: string) {
		const userDeleted = await prisma.user.delete({
			where: { id: userId },
		});
		return toPublicUser(userDeleted);
	}

	async updateOwnAvatar({ clientId, file }: UpdateClientAvatarServiceInput) {
		const client = await prisma.user.findUnique({
			where: { id: clientId, role: Role.client },
			select: {
				id: true,
				clientProfile: { select: { avatarUrl: true } },
			},
		});
		if (!client) throw new AppError(403, "Não autorizado");
		if (!client.clientProfile)
			throw new AppError(404, "Perfil de cliente não encontrado");

		const avatarUrl = await uploadService.saveFile(file.filename);

		try {
			const updatedClient = await prisma.user.update({
				where: { id: clientId, role: Role.client },
				data: { clientProfile: { update: { avatarUrl } } },
			});

			await uploadService.deleteUploadedFileByUrl(
				client.clientProfile.avatarUrl,
			);

			return {
				user: toPublicClient(updatedClient),
				profile: { avatarUrl },
			};
		} catch (error) {
			await uploadService.deleteUploadedFileByUrl(avatarUrl);
			throw error;
		}
	}
}

export { ClientService };
