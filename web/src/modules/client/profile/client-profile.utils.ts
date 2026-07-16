import type {
	ClientOwnProfile,
	ClientProfileMutationResponse,
} from "./client-profile.types";

export function mergeClientProfileMutation(
	currentProfile: ClientOwnProfile | null,
	mutation: ClientProfileMutationResponse,
): ClientOwnProfile | null {
	if (!currentProfile) return currentProfile;

	return {
		...currentProfile,
		name: mutation.user.name,
		email: mutation.user.email,
		clientProfile: currentProfile.clientProfile
			? {
					...currentProfile.clientProfile,
					avatarUrl: mutation.profile.avatarUrl,
				}
			: null,
	};
}
