import { z } from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().int().min(1).max(65535).default(2000),
	DATABASE_URL: z.url(),
	JWT_SECRET: z.string().min(32),
	CORS_ORIGINS: z
		.string()
		.default("http://localhost:5173,http://localhost:5174")
		.transform((value) => value.split(",").map((origin) => origin.trim()))
		.pipe(z.array(z.url()).min(1)),
});

export const env = envSchema.parse(process.env);
