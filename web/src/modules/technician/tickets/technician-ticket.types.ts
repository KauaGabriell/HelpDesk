import type { PaginatedResponse } from "../../../types/pagination";

export type TechnicianTicketStatus = "open" | "in_progress" | "closed";

export type TechnicianTicketService = {
	title: string | null;
	description: string | null;
	price: string | number;
	service: {
		id?: string;
		name: string;
		serviceCategory?: string;
	} | null;
};

export type TechnicianTicketListItem = {
	id: string;
	title: string;
	status: TechnicianTicketStatus;
	createdAt: string;
	totalPrice: number;
	ticketServices: TechnicianTicketService[];
};

export type TechnicianTicketDetails = TechnicianTicketListItem & {
	description: string | null;
	updatedAt: string;
	client: {
		name: string;
		clientProfile: { avatarUrl: string | null } | null;
	};
	technician: {
		name: string;
		email: string;
		technicianProfile: { avatarUrl: string | null } | null;
	};
};

export type PaginatedTechnicianTickets =
	PaginatedResponse<TechnicianTicketListItem>;

export type ExtraServiceFormValues = {
	title: string;
	description: string;
	price: string;
};

export type ExtraServiceInput = {
	title: string;
	description?: string;
	price: number;
};
