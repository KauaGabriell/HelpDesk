import type { User } from "../../generated/prisma/client";
export function toPublicClient(client: User) {
	return {
		id: client.id,
		name: client.name,
		email: client.email,
		isActive: client.isActive,
	};
}
