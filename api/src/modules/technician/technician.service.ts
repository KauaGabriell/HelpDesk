import { Role } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import type { PaginationQueryInput } from "../../shared/pagination.schema";
import { AppError } from "../../utils/AppError";
import {
	hashPassword,
	verifyPassword,
} from "../../utils/hashAndVerifyPassword";
import type { FileServiceInput } from "../upload/upload.schema";
import { UploadService } from "../upload/upload.service";
import { toPublicTechnician } from "./technician.mappers";
import type {
	ChangeTechnicianPasswordServiceInput,
	CreateTechnicianInput,
	UpdateOwnTechnicianProfileServiceInput,
	UpdateTechnicianByAdminServiceInput,
} from "./technician.schema";

type UpdateTechnicianAvatarServiceInput = {
	technicianId: string;
	file: FileServiceInput;
};

const uploadService = new UploadService();

export class TechnicianService {
	async create(input: CreateTechnicianInput) {
		const hashedPassword = await hashPassword(input.password);

		const createdTechnician = await prisma.$transaction(async (prisma) => {
			const existingUserWithEmail = await prisma.user.findUnique({
				where: { email: input.email },
			});
			if (existingUserWithEmail)
				throw new AppError(400, "E-mail Já Cadastrado");
			const createdTechnicianUser = await prisma.user.create({
				data: {
					name: input.name,
					email: input.email,
					passwordHash: hashedPassword,
					role: Role.technician,
					mustChangePassword: true,
				},
			});

			const createdTechnicianProfile = await prisma.technicianProfile.create({
				data: {
					userId: createdTechnicianUser.id,
					availability: input.availability,
				},
			});
			return {
				technicianUser: createdTechnicianUser,
				technicianProfile: createdTechnicianProfile,
			};
		});

		return toPublicTechnician(createdTechnician.technicianUser);
	}

	async list(query: PaginationQueryInput) {
		const { page, limit } = query;
		const skip = (page - 1) * limit;
		const where = { role: Role.technician };
		const [technicians, totalItems] = await prisma.$transaction([
			prisma.user.findMany({
				skip,
				take: limit,
				where,
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					isActive: true,
					mustChangePassword: true,
					technicianProfile: {
						select: {
							avatarUrl: true,
							availability: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			}),

			prisma.user.count({ where }),
		]);
		const totalPages = Math.ceil(totalItems / limit);
		return {
			data: technicians,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async getByAdmin(id: string) {
		const technician = await prisma.user.findFirst({
			where: { id, role: Role.technician },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isActive: true,
				mustChangePassword: true,
				technicianProfile: {
					select: {
						avatarUrl: true,
						availability: true,
					},
				},
			},
		});

		if (!technician) throw new AppError(404, "Técnico não encontrado");

		return technician;
	}

	async getOwnProfile(userId: string) {
		const ownTechnicianProfile = await prisma.user.findFirst({
			where: { id: userId, role: Role.technician },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isActive: true,
				technicianProfile: {
					select: {
						id: true,
						avatarUrl: true,
						availability: true,
					},
				},
			},
		});
		if (!ownTechnicianProfile) throw new AppError(404, "Não Encontrado");
		return ownTechnicianProfile;
	}

	async updateOwnProfile({
		userId,
		...input
	}: UpdateOwnTechnicianProfileServiceInput) {
		const updatedTechnician = await prisma.$transaction(async (prisma) => {
			const userUpdateData = {
				name: input.name,
				email: input.email,
			};
			const profileUpdateData = {
				avatarUrl: input.avatarUrl,
			};

			const authenticatedTechnician = await prisma.user.findFirst({
				where: { id: userId, role: Role.technician },
				select: {
					id: true,
					technicianProfile: {
						select: {
							id: true,
						},
					},
				},
			});
			if (!authenticatedTechnician) throw new AppError(403, "Não autorizado");
			if (!authenticatedTechnician.technicianProfile)
				throw new AppError(404, "Perfil de técnico não encontrado");

			if (userUpdateData.email) {
				const emailOwner = await prisma.user.findUnique({
					where: { email: userUpdateData.email },
					select: {
						id: true,
					},
				});
				if (emailOwner && emailOwner.id !== userId)
					throw new AppError(400, "E-mail já cadastrado");
			}

			const updatedTechnicianUser = await prisma.user.update({
				where: { id: userId },
				data: {
					name: userUpdateData.name,
					email: userUpdateData.email,
				},
				select: {
					name: true,
					email: true,
					role: true,
				},
			});

			const updatedTechnicianProfile = await prisma.technicianProfile.update({
				where: { userId: userId },
				data: {
					avatarUrl: profileUpdateData.avatarUrl,
				},
				select: {
					id: true,
					avatarUrl: true,
					availability: true,
				},
			});
			return { user: updatedTechnicianUser, profile: updatedTechnicianProfile };
		});
		return updatedTechnician;
	}

	async updateByAdmin({ id, ...input }: UpdateTechnicianByAdminServiceInput) {
		const updatedTechnician = await prisma.$transaction(async (prisma) => {
			const userUpdateData = {
				name: input.name,
				email: input.email,
				isActive: input.isActive,
			};
			const profileUpdateData = {
				availability: input.availability,
				avatarUrl: input.avatarUrl,
			};

			const technicianToUpdate = await prisma.user.findFirst({
				where: { id: id, role: Role.technician },
			});
			if (!technicianToUpdate)
				throw new AppError(400, "Usuário Não Encontrado");

			if (userUpdateData.email) {
				const emailOwner = await prisma.user.findUnique({
					where: { email: userUpdateData.email },
					select: {
						id: true,
					},
				});
				if (emailOwner && emailOwner.id !== id)
					throw new AppError(400, "E-mail já cadastrado");
			}

			const updatedUser = await prisma.user.update({
				where: { id: id },
				data: {
					name: userUpdateData.name,
					email: userUpdateData.email,
					isActive: userUpdateData.isActive,
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					mustChangePassword: true,
					isActive: true,
				},
			});

			const updatedTechnicianProfile = await prisma.technicianProfile.upsert({
				where: { userId: id },
				update: {
					avatarUrl: profileUpdateData.avatarUrl,
					availability: profileUpdateData.availability,
				},
				create: {
					userId: id,
					avatarUrl: profileUpdateData.avatarUrl,
					availability: profileUpdateData.availability ?? [],
				},
			});
			return {
				user: updatedUser,
				profile: updatedTechnicianProfile,
			};
		});
		return updatedTechnician;
	}

	async deleteByAdmin(id: string) {
		const technician = await prisma.user.findFirst({
			where: { id, role: Role.technician },
			select: { id: true },
		});
		if (!technician) throw new AppError(404, "Técnico não encontrado");

		const inactiveTechnician = await prisma.user.update({
			where: { id },
			data: {
				isActive: false,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isActive: true,
				mustChangePassword: true,
			},
		});

		return inactiveTechnician;
	}

	async changeOwnPassword({
		userId,
		oldPassword,
		newPassword,
	}: ChangeTechnicianPasswordServiceInput) {
		const user = await prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			throw new AppError(404, "Usuário não encontrado");
		}

		const passwordMatch = await verifyPassword(oldPassword, user.passwordHash);
		if (!passwordMatch) throw new AppError(400, "Senha Atual Inválida");

		const isCurrentPassword = await verifyPassword(
			newPassword,
			user.passwordHash,
		);
		if (isCurrentPassword)
			throw new AppError(400, "A nova senha deve ser diferente da senha atual");

		const newHashPassword = await hashPassword(newPassword);

		const updatedUser = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				passwordHash: newHashPassword,
				mustChangePassword: false,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				mustChangePassword: true,
			},
		});
		return updatedUser;
	}

	async updateOwnAvatar({
		technicianId,
		file,
	}: UpdateTechnicianAvatarServiceInput) {
		const technician = await prisma.user.findUnique({
			where: { id: technicianId, role: Role.technician },
			select: {
				id: true,
				technicianProfile: { select: { avatarUrl: true } },
			},
		});
		if (!technician) throw new AppError(403, "Não autorizado");
		if (!technician.technicianProfile)
			throw new AppError(404, "Perfil de técnico não encontrado");

		const avatarUrl = await uploadService.saveFile(file.filename);

		try {
			const updatedTechnician = await prisma.user.update({
				where: { id: technicianId, role: Role.technician },
				data: { technicianProfile: { update: { avatarUrl } } },
			});

			await uploadService.deleteUploadedFileByUrl(
				technician.technicianProfile.avatarUrl,
			);

			return {
				user: toPublicTechnician(updatedTechnician),
				profile: { avatarUrl },
			};
		} catch (error) {
			await uploadService.deleteUploadedFileByUrl(avatarUrl);
			throw error;
		}
	}
}
