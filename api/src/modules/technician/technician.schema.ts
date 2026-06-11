import { z } from "zod";

export const changeTechnicianPasswordSchema = z.object({
	oldPassword: z.string().min(5, "A Senha deve conter no mínimo 5 dígitos"),
	newPassword: z.string().min(5, "A Senha deve conter no mínimo 5 dígitos"),
});

export const updateOwnTechnicianProfileSchema = z
	.object({
		name: z.string().trim().min(1, "Insira um nome").optional(),
		email: z.email("E-mail Inválido").optional(),
		avatarUrl: z.url("URL do avatar inválida").optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "Informe ao menos um valor para atualizar",
	});

export const createTechnicianSchema = z.object({
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

export const updateTechnicianByAdminSchema = z
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

export const technicianIdParamsSchema = z.object({
	id: z.uuid(),
});

export type ChangeTechnicianPasswordInput = z.infer<
	typeof changeTechnicianPasswordSchema
>;
export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;
export type UpdateTechnicianByAdminInput = z.infer<
	typeof updateTechnicianByAdminSchema
>;
export type UpdateOwnTechnicianProfileInput = z.infer<
	typeof updateOwnTechnicianProfileSchema
>;

export type ChangeTechnicianPasswordServiceInput =
	ChangeTechnicianPasswordInput & {
		userId: string;
	};

export type UpdateTechnicianByAdminServiceInput =
	UpdateTechnicianByAdminInput & {
		id: string;
	};

export type UpdateOwnTechnicianProfileServiceInput =
	UpdateOwnTechnicianProfileInput & {
		userId: string;
	};
