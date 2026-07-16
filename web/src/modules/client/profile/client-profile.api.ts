import { api } from "../../../lib/api";
import type {
	ChangeOwnClientPasswordInput,
	ClientOwnProfile,
	ClientProfileMutationResponse,
	UpdateOwnClientProfileInput,
} from "./client-profile.types";

export function getOwnClientProfile(signal?: AbortSignal) {
	return api<ClientOwnProfile>("/client/me", { auth: true, signal });
}

export function updateOwnClientProfile(
	input: UpdateOwnClientProfileInput,
	signal?: AbortSignal,
) {
	return api<ClientProfileMutationResponse>("/client/me", {
		method: "PATCH",
		auth: true,
		body: JSON.stringify(input),
		signal,
	});
}

export function updateOwnClientAvatar(file: File, signal?: AbortSignal) {
	const formData = new FormData();
	formData.append("avatar", file);

	return api<ClientProfileMutationResponse>("/client/me/avatar", {
		method: "PATCH",
		auth: true,
		body: formData,
		signal,
	});
}

export function changeOwnClientPassword(
	input: ChangeOwnClientPasswordInput,
	signal?: AbortSignal,
) {
	return api<void>("/client/me/password", {
		method: "PATCH",
		auth: true,
		body: JSON.stringify(input),
		signal,
	});
}

export function deleteOwnClientProfile(signal?: AbortSignal) {
	return api<void>("/client/me", {
		method: "DELETE",
		auth: true,
		signal,
	});
}
