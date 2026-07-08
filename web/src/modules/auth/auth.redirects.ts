import type { UserRole } from "./auth.types";

const redirectPathByRole: Record<UserRole, string> = {
	admin: "/admin/tickets",
	client: "/client/tickets",
	technician: "/technician/tickets",
};

export function getRedirectPathByRole(role: UserRole) {
	return redirectPathByRole[role];
}
