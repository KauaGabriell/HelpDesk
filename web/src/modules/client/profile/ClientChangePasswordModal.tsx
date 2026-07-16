import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { Modal } from "../../../components/ui/Modal/Modal";
import { HttpError } from "../../../lib/http-error";
import { changeOwnClientPassword } from "./client-profile.api";
import type { ChangeOwnClientPasswordInput } from "./client-profile.types";

type ClientChangePasswordModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export function ClientChangePasswordModal({
	isOpen,
	onClose,
}: ClientChangePasswordModalProps) {
	const formId = "client-password-form";
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ChangeOwnClientPasswordInput>();

	async function handleChangePassword(input: ChangeOwnClientPasswordInput) {
		try {
			await changeOwnClientPassword(input);
			onClose();
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
		<Modal
			isOpen={isOpen}
			title="Alterar senha"
			onClose={isSubmitting ? () => undefined : onClose}
			footer={
				<Button
					type="submit"
					form={formId}
					className="w-full"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Salvando..." : "Salvar"}
				</Button>
			}
		>
			<form
				id={formId}
				className="flex flex-col gap-5"
				onSubmit={handleSubmit(handleChangePassword)}
			>
				<Input
					label="Senha atual"
					type="password"
					placeholder="Digite sua senha atual"
					error={errors.oldPassword?.message}
					{...register("oldPassword", { required: "Informe sua senha atual." })}
				/>
				<Input
					label="Nova senha"
					type="password"
					placeholder="Digite sua nova senha"
					helperText="Mínimo de 5 dígitos"
					error={errors.newPassword?.message}
					{...register("newPassword", {
						required: "Informe sua nova senha.",
						minLength: {
							value: 5,
							message: "A senha deve ter ao menos 5 caracteres.",
						},
					})}
				/>
				{errors.root?.message ? (
					<p role="alert" className="text-danger text-xs-regular">
						{errors.root.message}
					</p>
				) : null}
			</form>
		</Modal>
	);
}
