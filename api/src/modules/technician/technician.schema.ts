import { z } from "zod";

export const changePasswordSchema = z.object({
	oldPassword: z.string().min(5, "A Senha deve conter no mínimo 5 dígitos"),
	newPassword: z.string().min(5, "A Senha deve conter no mínimo 5 dígitos"),
});

export const updateOwnTechnicianSchema = z
	.object({
		name: z.string().trim().min(1, "Insira um nome").optional(),
		email: z.email("E-mail Inválido").optional(),
		avatarUrl: z.url("URL do avatar inválida").optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "Informe ao menos um valor para atualizar",
	});

export const technicianSchema = z.object({
	name: z.string().min(2, { message: "Insira o nome" }),
	email: z.email(),
	password: z
		.string()
		.min(5, { message: "A Senha deve conter no mínimo 5 dígitos" }),
	availability: z
		.string()
		.array()
		.optional()
		.default([
			"08:00",
			"09:00",
			"10:00",
			"11:00",
			"14:00",
			"15:00",
			"16:00",
			"17:00",
		]),
});

export const updateTechnicianSchema = z
	.object({
		name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional(),
		email: z.email("Email inválido").optional(),
		availability: z
			.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido"))
			.optional(),
		avatarUrl: z.url("URL do avatar inválida").optional(),
		isActive: z.boolean().optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "Informe ao menos um campo para atualizar",
	});

export const technicianParamsSchema = z.object({
	id: z.uuid(),
});

export type changePasswordInput = z.infer<typeof changePasswordSchema>;
export type technicianCreateInput = z.infer<typeof technicianSchema>;
export type updateTechnicianInput = z.infer<typeof updateTechnicianSchema>;
export type updateOwnTechnicianInput = z.infer<
	typeof updateOwnTechnicianSchema
>;

export type ChangePasswordServiceInput = changePasswordInput & {
	userId: string;
};

export type updateTechnicianServiceInput = updateTechnicianInput & {
	id: string;
};

export type updateOwnTechnicianServiceInput = updateOwnTechnicianInput & {
	userId: string;
};
