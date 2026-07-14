import type { PaginatedResponse } from "../../../types/pagination";

export type AdminClient = {
	id: string;
	name: string;
	email: string;
	role: "client";
	isActive: boolean;
	clientProfile: {
		id: string;
		userId: string;
		avatarUrl: string | null;
	} | null;
};

export type PaginatedAdminClients = PaginatedResponse<AdminClient>;

export type UpdateAdminClientInput = {
	name: string;
	email: string;
};
