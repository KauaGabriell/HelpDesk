import type { User } from "../../generated/prisma/client";

export function toPublicTechnician(technician: User) {
	return {
		id: technician.id,
		name: technician.name,
		email: technician.email,
		role: technician.role,
		isActive: technician.isActive,
		mustChangePassword: technician.mustChangePassword,
		createdAt: technician.createdAt,
		updatedAt: technician.updatedAt,
	};
}
