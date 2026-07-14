import { api } from "../../../lib/api";
import type {
	AdminTicketDetails,
	PaginatedAdminTickets,
	TicketStatus,
} from "./ticket.types";

type ListAdminTicketsOptions = {
	page: number;
	limit?: number;
	signal?: AbortSignal;
};

export function listAdminTickets({
	page,
	limit = 10,
	signal,
}: ListAdminTicketsOptions) {
	const query = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	return api<PaginatedAdminTickets>(`/tickets/admin?${query}`, {
		auth: true,
		signal,
	});
}

export function getAdminTicketDetails(ticketId: string, signal?: AbortSignal) {
	return api<AdminTicketDetails>(`/tickets/admin/${ticketId}`, {
		auth: true,
		signal,
	});
}

export function updateAdminTicketStatus(
	ticketId: string,
	status: TicketStatus,
	signal?: AbortSignal,
) {
	return api<{ id: string; status: TicketStatus }>(
		`/tickets/admin/${ticketId}`,
		{
			method: "PATCH",
			auth: true,
			body: JSON.stringify({ status }),
			signal,
		},
	);
}
