import { z } from "zod";

export const loginSchema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(5, { message: "A senha deve conter no mínimo 5 dígitos." }),
});

export const registerSchema = z.object({
	name: z.string().trim().min(1, { message: "Informe o nome" }),
	email: z.email({ message: "Informe um e-mail válido" }),
	password: z
		.string()
		.min(5, { message: "A senha deve conter no mínimo 5 dígitos." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
