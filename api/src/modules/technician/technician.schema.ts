import { z } from "zod";

export const changePasswordSchema = z.object({
	oldPassword: z.string().min(5, "A Senha deve conter no mínimo 5 dígitos"),
	newPassword: z.string().min(5, "A Senha deve conter no mínimo 5 dígitos"),
});

export type changePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangePasswordServiceInput = changePasswordInput & {
	userId: string;
};
