import { api } from "../../lib/api";
import type { AuthUser, LoginInput, LoginResponse } from "./auth.types";

export function login(input: LoginInput) {
	return api<LoginResponse>("/auth/login", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export function getMe() {
	return api<AuthUser>("/auth/me", {
		auth: true,
	});
}
