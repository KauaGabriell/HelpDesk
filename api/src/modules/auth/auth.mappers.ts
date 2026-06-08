import type { User } from "../../generated/prisma/client";

export function toPublicUser(user: User) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		isActive: user.isActive,
		mustChangePassword: user.mustChangePassword,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}
