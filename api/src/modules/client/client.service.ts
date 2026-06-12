import { Role } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import { AppError } from "../../utils/AppError";
import { toPublicClient } from "./client.mappers";
import type {
	UpdateClientByAdminServiceInput,
	UpdateOwnClientProfileServiceInput,
} from "./client.schema";

class ClientService {
	async listByAdmin() {
		const clients = await prisma.user.findMany({
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
		});
		return clients;
	}

	async updateByAdmin({ userId, ...data }: UpdateClientByAdminServiceInput) {
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

		return deletedUser;
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
		return userDeleted;
	}
}

export { ClientService };
