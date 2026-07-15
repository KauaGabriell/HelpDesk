import { api } from "../../../lib/api";
import type {
	ChangeOwnTechnicianPasswordInput,
	TechnicianOwnProfile,
	TechnicianProfileMutationResponse,
	UpdateOwnTechnicianProfileInput,
} from "./technician-profile.types";

export function getOwnTechnicianProfile(signal?: AbortSignal) {
	return api<TechnicianOwnProfile>("/technician/me", {
		auth: true,
		signal,
	});
}

export function updateOwnTechnicianProfile(
	input: UpdateOwnTechnicianProfileInput,
	signal?: AbortSignal,
) {
	return api<TechnicianProfileMutationResponse>("/technician/me", {
		method: "PATCH",
		auth: true,
		body: JSON.stringify(input),
		signal,
	});
}

export function updateOwnTechnicianAvatar(file: File, signal?: AbortSignal) {
	const formData = new FormData();
	formData.append("avatar", file);

	return api<TechnicianProfileMutationResponse>("/technician/me/avatar", {
		method: "PATCH",
		auth: true,
		body: formData,
		signal,
	});
}

export function changeOwnTechnicianPassword(
	input: ChangeOwnTechnicianPasswordInput,
	signal?: AbortSignal,
) {
	return api<void>("/technician/me/password", {
		method: "PATCH",
		auth: true,
		body: JSON.stringify(input),
		signal,
	});
}
