import { api } from "../../../lib/api";
import type {
	AdminService,
	CreateAdminServiceInput,
	PaginatedAdminServices,
	UpdateAdminServiceInput,
} from "./service.types";

type ListAdminServicesOptions = {
	page: number;
	limit?: number;
	signal?: AbortSignal;
};

export function listAdminServices({
	page,
	limit = 10,
	signal,
}: ListAdminServicesOptions) {
	const query = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	return api<PaginatedAdminServices>(`/services?${query}`, {
		auth: true,
		signal,
	});
}

export function createAdminService(
	input: CreateAdminServiceInput,
	signal?: AbortSignal,
) {
	return api<AdminService>("/services", {
		method: "POST",
		auth: true,
		body: JSON.stringify(input),
		signal,
	});
}

export function updateAdminService(
	serviceId: string,
	input: UpdateAdminServiceInput,
	signal?: AbortSignal,
) {
	return api<AdminService>(`/services/${serviceId}`, {
		method: "PATCH",
		auth: true,
		body: JSON.stringify(input),
		signal,
	});
}

export function updateAdminServiceStatus(
	serviceId: string,
	isActive: boolean,
	signal?: AbortSignal,
) {
	return api<AdminService>(`/services/${serviceId}/status`, {
		method: "PATCH",
		auth: true,
		body: JSON.stringify({ isActive }),
		signal,
	});
}
