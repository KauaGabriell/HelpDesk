import { env } from "../config/env";
import { HttpError } from "./http-error";
import { getAuthToken } from "./storage";

type ApiRequestOptions = RequestInit & {
	auth?: boolean;
};

function findFirstErrorMessage(value: unknown): string | null {
	if (typeof value === "string") return value;
	if (Array.isArray(value)) {
		for (const item of value) {
			const message = findFirstErrorMessage(item);
			if (message) return message;
		}
		return null;
	}
	if (value && typeof value === "object") {
		for (const item of Object.values(value)) {
			const message = findFirstErrorMessage(item);
			if (message) return message;
		}
	}
	return null;
}

function getApiErrorMessage(data: unknown) {
	if (!data || typeof data !== "object" || !("message" in data)) {
		return "Erro ao comunicar com o servidor";
	}

	return (
		findFirstErrorMessage(data.message) ?? "Erro ao comunicar com o servidor"
	);
}

export async function api<TResponse>(
	path: string,
	options: ApiRequestOptions = {},
) {
	const { auth = false, headers, ...fetchOptions } = options;
	const token = getAuthToken();
	const isFormData =
		typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;
	const baseUrl = env.apiUrl.endsWith("/") ? env.apiUrl : `${env.apiUrl}/`;
	const requestPath = path.startsWith("/") ? path.slice(1) : path;

	const response = await fetch(new URL(requestPath, baseUrl), {
		...fetchOptions,
		headers: {
			...(!isFormData ? { "Content-Type": "application/json" } : {}),
			...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
			...headers,
		},
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new HttpError(response.status, getApiErrorMessage(data), data);
	}

	return data as TResponse;
}
