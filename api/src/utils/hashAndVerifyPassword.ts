import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
	const hashedPassword = await bcrypt.hash(password, 10);
	return hashedPassword;
}

export async function verifyPassword(password: string, userPassword: string) {
	const passwordMatch = await bcrypt.compare(password, userPassword);
	return passwordMatch;
}
