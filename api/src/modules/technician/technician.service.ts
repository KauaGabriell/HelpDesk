import { Role } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import { AppError } from "../../utils/AppError";
import {
	hashPassword,
	verifyPassword,
} from "../../utils/hashAndVerifyPassword";
import { toPublicTechnician } from "./technician.mappers";
import type {
	ChangePasswordServiceInput,
	technicianCreateInput,
	updateOwnTechnicianServiceInput,
	updateTechnicianServiceInput,
} from "./technician.schema";

export class TechnicianService {
	async create(data: technicianCreateInput) {
		const hashedPassword = await hashPassword(data.password);

		const technician = await prisma.$transaction(async (prisma) => {
			const emailAlreadyExist = await prisma.user.findUnique({
				where: { email: data.email },
			});
			if (emailAlreadyExist) throw new AppError(400, "E-mail Já Cadastrado");
			const technicianUser = await prisma.user.create({
				data: {
					name: data.name,
					email: data.email,
					passwordHash: hashedPassword,
					role: Role.technician,
					mustChangePassword: true,
				},
			});

			const technicianProfile = await prisma.technicianProfile.create({
				data: {
					userId: technicianUser.id,
					availability: data.availability,
				},
			});
			return { technicianUser, technicianProfile };
		});

		return toPublicTechnician(technician.technicianUser);
	}

	async index() {
		const technicians = await prisma.user.findMany({
			where: {
				role: Role.technician,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isActive: true,
				mustChangePassword: true,
				createdAt: true,
				updatedAt: true,
				technicianProfile: {
					select: {
						id: true,
						avatarUrl: true,
						availability: true,
					},
				},
			},
		});

		return technicians;
	}

	async showOwnProfile(userId: string) {
		const technicianProfile = await prisma.user.findFirst({
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
		if (!technicianProfile) throw new AppError(404, "Não Encontrado");
		return technicianProfile;
	}

	async updateOwnTechnicianProfile({
		userId,
		...data
	}: updateOwnTechnicianServiceInput) {
		const newTechnician = await prisma.$transaction(async (prisma) => {
			const userData = {
				name: data.name,
				email: data.email,
			};
			const profileData = {
				avatarUrl: data.avatarUrl,
			};

			const technician = await prisma.user.findFirst({
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
			if (!technician) throw new AppError(403, "Não autorizado");
			if (!technician.technicianProfile)
				throw new AppError(404, "Perfil de técnico não encontrado");

			if (userData.email) {
				const emailOwner = await prisma.user.findUnique({
					where: { email: userData.email },
					select: {
						id: true,
					},
				});
				if (emailOwner && emailOwner.id !== userId)
					throw new AppError(400, "E-mail já cadastrado");
			}

			const newTechnicianUser = await prisma.user.update({
				where: { id: userId },
				data: {
					name: userData.name,
					email: userData.email,
				},
				select: {
					name: true,
					email: true,
					role: true,
				},
			});

			const newTechnicianProfile = await prisma.technicianProfile.update({
				where: { userId: userId },
				data: {
					avatarUrl: profileData.avatarUrl,
				},
				select: {
					id: true,
					avatarUrl: true,
					availability: true,
				},
			});
			return { user: newTechnicianUser, profile: newTechnicianProfile };
		});
		return newTechnician;
	}

	async update({ id, ...data }: updateTechnicianServiceInput) {
		const updateTechnician = await prisma.$transaction(async (prisma) => {
			const userData = {
				name: data.name,
				email: data.email,
				isActive: data.isActive,
			};
			const profileData = {
				availability: data.availability,
				avatarUrl: data.avatarUrl,
			};

			const user = await prisma.user.findFirst({
				where: { id: id, role: Role.technician },
			});
			if (!user) throw new AppError(400, "Usuário Não Encontrado");

			const userToUpdate = await prisma.user.update({
				where: { id: id },
				data: {
					name: userData.name,
					email: userData.email,
					isActive: userData.isActive,
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

			const technicianProfile = await prisma.technicianProfile.update({
				where: { userId: id },
				data: {
					avatarUrl: profileData.avatarUrl,
					availability: profileData.availability,
				},
			});
			return { userToUpdate, technicianProfile };
		});
		return updateTechnician;
	}

	async changePassword({
		userId,
		oldPassword,
		newPassword,
	}: ChangePasswordServiceInput) {
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

		const userUpdated = await prisma.user.update({
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
		return userUpdated;
	}
}
