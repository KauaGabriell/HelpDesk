import { api } from "../../../lib/api";
import type {
	ActiveService,
	ClientTicketDetails,
	CreateClientTicketInput,
	PaginatedClientTickets,
} from "./client-ticket.types";

type ListClientTicketsOptions = {
	page: number;
	limit?: number;
	signal?: AbortSignal;
};

export function listClientTickets({
	page,
	limit = 10,
	signal,
}: ListClientTicketsOptions) {
	const query = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	return api<PaginatedClientTickets>(`/tickets/client/me?${query}`, {
		auth: true,
		signal,
	});
}

export function getClientTicket(ticketId: string, signal?: AbortSignal) {
	return api<ClientTicketDetails>(`/tickets/client/${ticketId}`, {
		auth: true,
		signal,
	});
}

export function listActiveServices(signal?: AbortSignal) {
	return api<ActiveService[]>("/services/active", { auth: true, signal });
}

export function createClientTicket(
	input: CreateClientTicketInput,
	signal?: AbortSignal,
) {
	return api<{ id: string }>("/tickets/client", {
		method: "POST",
		auth: true,
		body: JSON.stringify(input),
		signal,
	});
}
