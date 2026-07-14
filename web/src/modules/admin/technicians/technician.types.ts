import type { PaginatedResponse } from "../../../types/pagination";

export type TechnicianProfile = {
	avatarUrl: string | null;
	availability: string[];
};

export type AdminTechnician = {
	id: string;
	name: string;
	email: string;
	role: "technician";
	isActive: boolean;
	mustChangePassword: boolean;
	technicianProfile: TechnicianProfile | null;
};

export type PaginatedAdminTechnicians = PaginatedResponse<AdminTechnician>;

export type CreateAdminTechnicianInput = {
	name: string;
	email: string;
	password: string;
	availability?: string[];
};

export type UpdateAdminTechnicianInput = {
	name: string;
	email: string;
	availability: string[];
};
