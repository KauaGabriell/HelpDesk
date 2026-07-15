import { api } from "../../../lib/api";
import type {
	ExtraServiceInput,
	PaginatedTechnicianTickets,
	TechnicianTicketDetails,
} from "./technician-ticket.types";

type ListTechnicianTicketsOptions = {
	page: number;
	limit?: number;
	signal?: AbortSignal;
};

export function listTechnicianTickets({
	page,
	limit = 10,
	signal,
}: ListTechnicianTicketsOptions) {
	const query = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	return api<PaginatedTechnicianTickets>(`/tickets/technician/me?${query}`, {
		auth: true,
		signal,
	});
}

export function getTechnicianTicket(ticketId: string, signal?: AbortSignal) {
	return api<TechnicianTicketDetails>(`/tickets/technician/${ticketId}`, {
		auth: true,
		signal,
	});
}

export function startTechnicianTicket(ticketId: string, signal?: AbortSignal) {
	return api<{ id: string; status: "in_progress" }>(
		`/tickets/technician/${ticketId}/start`,
		{ method: "PATCH", auth: true, signal },
	);
}

export function closeTechnicianTicket(ticketId: string, signal?: AbortSignal) {
	return api<{ id: string; status: "closed" }>(
		`/tickets/technician/${ticketId}/close`,
		{ method: "PATCH", auth: true, signal },
	);
}

export function addTechnicianExtraService(
	ticketId: string,
	input: ExtraServiceInput,
	signal?: AbortSignal,
) {
	return api<{ id: string }>(`/tickets/technician/${ticketId}/extra-services`, {
		method: "POST",
		auth: true,
		body: JSON.stringify(input),
		signal,
	});
}
