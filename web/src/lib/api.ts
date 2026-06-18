import { env } from "../config/env";
import { HttpError } from "./http-error";
import { getAuthToken } from "./storage";

type ApiRequestOptions = RequestInit & {
	auth?: boolean;
};

export async function api<TResponse>(
	path: string,
	options: ApiRequestOptions = {},
) {
	const { auth = false, headers, ...fetchOptions } = options;
	const token = getAuthToken();
	const baseUrl = env.apiUrl.endsWith("/") ? env.apiUrl : `${env.apiUrl}/`;
	const requestPath = path.startsWith("/") ? path.slice(1) : path;

	const response = await fetch(new URL(requestPath, baseUrl), {
		...fetchOptions,
		headers: {
			"Content-Type": "application/json",
			...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
			...headers,
		},
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new HttpError(
			response.status,
			data?.message ?? "Erro ao comunicar com o servidor",
			data,
		);
	}

	return data as TResponse;
}
