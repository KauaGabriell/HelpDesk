export type UserRole = "admin" | "technician" | "client";

export type AuthUser = {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	mustChangePassword: boolean;
};

export type LoginInput = {
	email: string;
	password: string;
};

export type LoginResponse = {
	token: string;
	user: AuthUser;
};
