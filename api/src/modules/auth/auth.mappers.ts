import type { User } from "../../generated/prisma/client";
import type { UserWithProfiles } from "../../types/userWithProfiles";

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

export function toMeUser(user: UserWithProfiles) {
	const baseUser = {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		mustChangePassword: user.mustChangePassword,
	};
	if (user.role === "client")
		return { ...baseUser, profile: user.clientProfile };

	if (user.role === "technician")
		return { ...baseUser, profile: user.technicianProfile };

	return {
		...baseUser,
		profile: null,
	};
}
