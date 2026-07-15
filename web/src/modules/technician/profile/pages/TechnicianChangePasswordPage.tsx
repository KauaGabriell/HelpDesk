import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/Button/Button";
import { Input } from "../../../../components/ui/Input/Input";
import { HttpError } from "../../../../lib/http-error";
import { useAuth } from "../../../auth/auth.store";
import { changeOwnTechnicianPassword } from "../technician-profile.api";
import type { ChangeOwnTechnicianPasswordInput } from "../technician-profile.types";

export function TechnicianChangePasswordPage() {
	const { user, updateUser } = useAuth();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ChangeOwnTechnicianPasswordInput>();

	if (!user?.mustChangePassword) {
		return <Navigate to="/technician/tickets" replace />;
	}

	async function handleChangePassword(input: ChangeOwnTechnicianPasswordInput) {
		try {
			await changeOwnTechnicianPassword(input);
			updateUser({ mustChangePassword: false });
			navigate("/technician/tickets", { replace: true });
		} catch (error) {
			setError("root", {
				message:
					error instanceof HttpError
						? error.message
						: "Não foi possível alterar a senha.",
			});
		}
	}

	return (
		<section className="mx-auto w-full max-w-96 rounded-lg border border-gray-500 bg-gray-600 p-6">
			<h1 className="text-brand-dark text-xl-bold">Alterar senha</h1>
			<p className="mt-2 text-gray-300 text-sm-regular">
				Defina uma nova senha para continuar usando a plataforma.
			</p>
			<form
				className="mt-6 flex flex-col gap-5"
				onSubmit={handleSubmit(handleChangePassword)}
			>
				<Input
					label="Senha atual"
					type="password"
					placeholder="Digite sua senha atual"
					error={errors.oldPassword?.message}
					{...register("oldPassword", {
						required: "Informe sua senha atual.",
					})}
				/>
				<Input
					label="Nova senha"
					type="password"
					placeholder="Digite sua nova senha"
					helperText="Mínimo de 6 dígitos"
					error={errors.newPassword?.message}
					{...register("newPassword", {
						required: "Informe sua nova senha.",
						minLength: {
							value: 6,
							message: "A senha deve ter ao menos 6 caracteres.",
						},
					})}
				/>
				{errors.root?.message ? (
					<p role="alert" className="text-danger text-xs-regular">
						{errors.root.message}
					</p>
				) : null}
				<Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
					{isSubmitting ? "Salvando..." : "Salvar"}
				</Button>
			</form>
		</section>
	);
}
