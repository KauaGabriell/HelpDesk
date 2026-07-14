import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Avatar } from "../../../components/ui/Avatar/Avatar";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { Modal } from "../../../components/ui/Modal/Modal";
import { HttpError } from "../../../lib/http-error";
import { getUploadUrl } from "../../../lib/upload-url";
import { updateAdminClient } from "./client.api";
import type { AdminClient, UpdateAdminClientInput } from "./client.types";

type EditClientModalProps = {
	client: AdminClient | null;
	onClose: () => void;
	onSuccess: () => void;
};

export function EditClientModal({
	client,
	onClose,
	onSuccess,
}: EditClientModalProps) {
	const submitControllerRef = useRef<AbortController | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<UpdateAdminClientInput>();

	useEffect(() => {
		if (!client) return;
		reset({ name: client.name, email: client.email });
	}, [client, reset]);

	useEffect(
		() => () => {
			submitControllerRef.current?.abort();
		},
		[],
	);

	async function handleUpdate(input: UpdateAdminClientInput) {
		if (!client) return;
		submitControllerRef.current?.abort();
		const controller = new AbortController();
		submitControllerRef.current = controller;

		try {
			await updateAdminClient(
				client.id,
				{
					name: input.name.trim(),
					email: input.email.trim(),
				},
				controller.signal,
			);
			onSuccess();
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			setError("root", {
				message:
					error instanceof HttpError
						? error.message
						: "Não foi possível atualizar o cliente.",
			});
		}
	}

	const formId = "edit-client-form";

	return (
		<Modal
			isOpen={Boolean(client)}
			title="Cliente"
			onClose={isSubmitting ? () => undefined : onClose}
			footer={
				<>
					<Button
						variant="secondary"
						className="flex-1"
						onClick={onClose}
						disabled={isSubmitting}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						form={formId}
						className="flex-1"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Salvando..." : "Salvar"}
					</Button>
				</>
			}
		>
			{client ? (
				<form
					id={formId}
					className="flex flex-col gap-5"
					onSubmit={handleSubmit(handleUpdate)}
				>
					<Avatar
						name={client.name}
						src={getUploadUrl(client.clientProfile?.avatarUrl)}
						size="md"
					/>
					<Input
						label="Nome"
						error={errors.name?.message}
						{...register("name", {
							required: "Nome é obrigatório.",
							validate: (value) =>
								value.trim().length > 0 || "Nome é obrigatório.",
						})}
					/>
					<Input
						label="E-mail"
						type="email"
						error={errors.email?.message}
						{...register("email", {
							required: "E-mail é obrigatório.",
							pattern: {
								value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
								message: "Informe um e-mail válido.",
							},
						})}
					/>
					{errors.root?.message ? (
						<p role="alert" className="text-danger text-xs-regular">
							{errors.root.message}
						</p>
					) : null}
				</form>
			) : null}
		</Modal>
	);
}
