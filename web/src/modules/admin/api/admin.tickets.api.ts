import { api } from "../../../lib/api";
import type { PaginatedAdminTickets } from "../types/admin-tickets.types";

export function listAdminTickets(page = 1, limit = 10) {
	const query = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	return api<PaginatedAdminTickets>(`/tickets/admin?${query}`, {
		auth: true,
	});
}
