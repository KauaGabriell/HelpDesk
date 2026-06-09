import type {
	ClientProfile,
	TechnicianProfile,
	User,
} from "../generated/prisma/client";
export type UserWithProfiles = User & {
	clientProfile: ClientProfile | null;
	technicianProfile: TechnicianProfile | null;
};
