import { z } from "zod";

export const clientIdParamsSchema = z.object({
	userId: z.uuid(),
});

export const updateClientByAdminSchema = z
	.object({
		name: z.string().trim().min(1, "Insira o Nome").optional(),
		email: z.email("E-mail Inválido").optional(),
	})
	.refine((client) => Object.keys(client).length > 0, {
		message: "Altere pelo menos um campo",
	});

export const updateOwnClientProfileSchema = z
	.object({
		name: z.string().trim().min(1, "Insira o novo nome").optional(),
		email: z.email("E-mail Inválido").optional(),
		avatarUrl: z.url().optional(),
	})
	.refine((client) => Object.keys(client).length > 0, {
		message: "Altere pelo menos um campo",
	});

export const changeClientPasswordSchema = z.object({
	oldPassword: z.string().min(5, "A senha deve conter no mínimo 5 dígitos"),
	newPassword: z.string().min(5, "A senha deve conter no mínimo 5 dígitos"),
});

export type UpdateClientByAdminInput = z.infer<
	typeof updateClientByAdminSchema
>;

export type UpdateOwnClientProfileInput = z.infer<
	typeof updateOwnClientProfileSchema
>;
export type ChangeClientPasswordInput = z.infer<
	typeof changeClientPasswordSchema
>;

export type UpdateClientByAdminServiceInput = UpdateClientByAdminInput & {
	userId: string;
};

export type UpdateOwnClientProfileServiceInput = UpdateOwnClientProfileInput & {
	userId: string;
};

export type ChangeClientPasswordServiceInput = ChangeClientPasswordInput & {
	userId: string;
};
