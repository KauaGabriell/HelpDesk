export type TechnicianOwnProfile = {
	id: string;
	name: string;
	email: string;
	role: "technician";
	isActive: boolean;
	technicianProfile: {
		id: string;
		avatarUrl: string | null;
		availability: string[];
	} | null;
};

export type UpdateOwnTechnicianProfileInput = {
	name: string;
	email: string;
};

export type TechnicianProfileMutationResponse = {
	user: Pick<TechnicianOwnProfile, "name" | "email" | "role">;
	profile: {
		avatarUrl: string | null;
		availability?: string[];
	};
};

export type ChangeOwnTechnicianPasswordInput = {
	oldPassword: string;
	newPassword: string;
};
