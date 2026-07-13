import { env } from "../config/env";

export function getUploadUrl(filePath?: string | null) {
	if (!filePath) {
		return undefined;
	}

	return new URL(filePath, env.apiUrl).toString();
}
