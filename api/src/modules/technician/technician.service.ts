import { prisma } from "../../libs/prisma";
import { AppError } from "../../utils/AppError";
import {
	hashPassword,
	verifyPassword,
} from "../../utils/hashAndVerifyPassword";
import type { ChangePasswordServiceInput } from "./technician.schema";

export class TechnicianService {
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
