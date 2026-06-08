import type { SignOptions } from "jsonwebtoken";

export const authConfig = {
	jwt: {
		secret: process.env.JWT_SECRET,
		expiresIn: "1d" as SignOptions["expiresIn"],
	},
};
