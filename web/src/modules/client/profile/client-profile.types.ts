export type ClientOwnProfile = {
	id: string;
	name: string;
	email: string;
	clientProfile: { avatarUrl: string | null } | null;
};

export type ClientProfileMutationResponse = {
	user: { id: string; name: string; email: string };
	profile: { avatarUrl: string | null };
};

export type UpdateOwnClientProfileInput = {
	name: string;
	email: string;
};

export type ChangeOwnClientPasswordInput = {
	oldPassword: string;
	newPassword: string;
};
