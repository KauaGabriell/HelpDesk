import type { PaginatedResponse } from "../../../types/pagination";

export type TicketStatus = "open" | "in_progress" | "closed";

export type TicketService = {
	title: string | null;
	description: string | null;
	price: string;
	service: {
		id?: string;
		name: string;
		price?: string;
		serviceCategory?: string;
	} | null;
};

export type AdminTicket = {
	id: string;
	title: string;
	description?: string | null;
	status: TicketStatus;
	updatedAt: string;
	totalPrice: number;
	client: {
		name: string;
		clientProfile: { avatarUrl: string | null } | null;
	};
	technician: {
		name: string;
		technicianProfile: { avatarUrl: string | null } | null;
	};
	ticketServices: TicketService[];
};

export type AdminTicketDetails = Omit<AdminTicket, "technician"> & {
	description: string | null;
	createdAt: string;
	technician: {
		name: string;
		email: string;
		technicianProfile: { avatarUrl: string | null } | null;
	};
};

export type PaginatedAdminTickets = PaginatedResponse<AdminTicket>;
