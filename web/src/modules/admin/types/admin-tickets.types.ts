export type TicketStatus = "open" | "in_progress" | "closed";

export type AdminTicket = {
	id: string;
	title: string;
	status: TicketStatus;
	updatedAt: string;
	totalPrice: number;
	client: {
		name: string;
		clientProfile: {
			avatarUrl: string | null;
		} | null;
	};
	technician: {
		name: string;
		technicianProfile: {
			avatarUrl: string | null;
		} | null;
	};
	ticketServices: Array<{
		title: string | null;
		description: string | null;
		price: number;
		service: {
			name: string;
			price: number;
		} | null;
	}>;
};

export type PaginatedAdminTickets = {
	data: AdminTicket[];
	pagination: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
};
