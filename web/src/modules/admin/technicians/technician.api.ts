import { api } from "../../../lib/api";
import type {
	AdminTechnician,
	CreateAdminTechnicianInput,
	PaginatedAdminTechnicians,
	UpdateAdminTechnicianInput,
} from "./technician.types";

type ListAdminTechniciansOptions = {
	page: number;
	limit?: number;
	signal?: AbortSignal;
};

export function listAdminTechnicians({
	page,
	limit = 10,
	signal,
}: ListAdminTechniciansOptions) {
	const query = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	return api<PaginatedAdminTechnicians>(`/technician?${query}`, {
		auth: true,
		signal,
	});
}

export function getAdminTechnician(id: string, signal?: AbortSignal) {
	return api<AdminTechnician>(`/technician/${id}`, {
		auth: true,
		signal,
	});
}

export function createAdminTechnician(
	input: CreateAdminTechnicianInput,
	signal?: AbortSignal,
) {
	return api<AdminTechnicianUser>("/technician", {
		method: "POST",
		auth: true,
		body: JSON.stringify(input),
		signal,
	});
}

export function updateAdminTechnician(
	id: string,
	input: UpdateAdminTechnicianInput,
	signal?: AbortSignal,
) {
	return api<{ user: AdminTechnicianUser; profile: TechnicianProfile }>(
		`/technician/${id}`,
		{
			method: "PATCH",
			auth: true,
			body: JSON.stringify(input),
			signal,
		},
	);
}

type TechnicianProfile = {
	avatarUrl: string | null;
	availability: string[];
};

type AdminTechnicianUser = Omit<AdminTechnician, "technicianProfile">;
