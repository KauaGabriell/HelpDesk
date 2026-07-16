import jwt from "jsonwebtoken";
import { Role } from "../../src/generated/prisma/enums";
import { prisma } from "../../src/libs/prisma";
import { hashPassword } from "../../src/utils/hashAndVerifyPassword";

type CreateTestUserInput = {
	name?: string;
	email?: string;
	password?: string;
	role?: Role;
};

export async function createTestUser({
	name = "Test User",
	email = `user-${crypto.randomUUID()}@test.com`,
	password = "123456",
	role = Role.client,
}: CreateTestUserInput = {}) {
	const passwordHash = await hashPassword(password);
	const user = await prisma.user.create({
		data: {
			name,
			email,
			passwordHash,
			role,
			...(role === Role.client
				? { clientProfile: { create: {} } }
				: role === Role.technician
					? { technicianProfile: { create: { availability: [] } } }
					: {}),
		},
	});

	return { user, password };
}

export function createTestToken(userId: string, role: Role) {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error("JWT_SECRET de teste não configurado.");

	return jwt.sign({ role }, secret, { subject: userId, expiresIn: "1h" });
}
