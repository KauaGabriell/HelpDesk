import { api } from "../../../lib/api";
import type {
	PaginatedAdminClients,
	UpdateAdminClientInput,
} from "./client.types";

type ListAdminClientsOptions = {
	page: number;
	limit?: number;
	signal?: AbortSignal;
};

export function listAdminClients({
	page,
	limit = 10,
	signal,
}: ListAdminClientsOptions) {
	const query = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	return api<PaginatedAdminClients>(`/client?${query}`, {
		auth: true,
		signal,
	});
}

export function updateAdminClient(
	clientId: string,
	input: UpdateAdminClientInput,
	signal?: AbortSignal,
) {
	return api<{ id: string; name: string; email: string; isActive: boolean }>(
		`/client/${clientId}`,
		{
			method: "PATCH",
			auth: true,
			body: JSON.stringify(input),
			signal,
		},
	);
}

export function deleteAdminClient(clientId: string, signal?: AbortSignal) {
	return api<{ message: string }>(`/client/${clientId}`, {
		method: "DELETE",
		auth: true,
		signal,
	});
}
