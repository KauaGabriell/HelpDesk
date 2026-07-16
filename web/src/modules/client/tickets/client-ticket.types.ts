import type { PaginatedResponse } from "../../../types/pagination";

export type ClientTicketStatus = "open" | "in_progress" | "closed";

export type ClientTicketService = {
	title: string | null;
	description: string | null;
	price: string | number;
	service: {
		id?: string;
		name: string;
		serviceCategory?: string;
	} | null;
};

export type ClientTicketListItem = {
	id: string;
	title: string;
	status: ClientTicketStatus;
	createdAt: string;
	updatedAt: string;
	totalPrice: string | number;
	technician: {
		name: string;
		technicianProfile: { avatarUrl: string | null } | null;
	};
	ticketServices: ClientTicketService[];
};

export type ClientTicketDetails = Omit<
	ClientTicketListItem,
	"technician" | "updatedAt"
> & {
	description: string | null;
	updatedAt: string;
	technician: {
		name: string;
		email: string;
		technicianProfile: { avatarUrl: string | null } | null;
	};
};

export type PaginatedClientTickets = PaginatedResponse<ClientTicketListItem>;

export type ActiveService = {
	id: string;
	name: string;
	price: string | number;
	serviceCategory: string;
};

export type CreateClientTicketInput = {
	title: string;
	description?: string;
	serviceIds: string[];
};
