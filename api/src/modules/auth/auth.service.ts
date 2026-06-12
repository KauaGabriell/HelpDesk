import jwt from "jsonwebtoken";
import { authConfig } from "../../config/Auth";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import { AppError } from "../../utils/AppError";
import {
	hashPassword,
	verifyPassword,
} from "../../utils/hashAndVerifyPassword";
import { toMeUser, toPublicUser } from "./auth.mappers";
import type { LoginInput, RegisterInput } from "./auth.schema";

export class AuthService {
	async register(data: RegisterInput) {
		const hashedPassword = await hashPassword(data.password);
		const profile = await prisma.$transaction(async (prisma) => {
			const user = await prisma.user.findFirst({
				where: { email: data.email },
			});
			if (user) throw new AppError(404, "E-mail já cadastrado!");

			const newUser = await prisma.user.create({
				data: {
					name: data.name,
					email: data.email,
					passwordHash: hashedPassword,
					role: Role.client,
				},
			});

			const clientProfile = await prisma.clientProfile.create({
				data: {
					userId: newUser.id,
				},
			});

			return { newUser, clientProfile };
		});

		return toPublicUser(profile.newUser);
	}
	async login(data: LoginInput) {
		const { secret, expiresIn } = authConfig.jwt;
		const user = await prisma.user.findUnique({ where: { email: data.email } });
		if (!user) throw new AppError(401, "Credenciais Inválidas");
		if (user.isActive === false)
			throw new AppError(401, "Credenciais Inválidas");

		const passwordMatch = await verifyPassword(
			data.password,
			user.passwordHash,
		);
		if (!passwordMatch) throw new AppError(401, "Credenciais Inválidas");

		if (!secret) throw new AppError(500, "JWT Secret Missing");
		const token = jwt.sign({ role: user.role }, secret, {
			subject: user.id,
			expiresIn: expiresIn,
		});

		return {
			token,
			user: toPublicUser(user),
		};
	}
	async getMe(userId: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				clientProfile: true,
				technicianProfile: true,
			},
		});
		if (!user) throw new AppError(404, "Usuário não Encontrado");
		return toMeUser(user);
	}
}
