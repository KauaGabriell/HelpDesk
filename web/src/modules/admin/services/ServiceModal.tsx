import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { Modal } from "../../../components/ui/Modal/Modal";
import { HttpError } from "../../../lib/http-error";
import { createAdminService, updateAdminService } from "./service.api";
import {
	type AdminService,
	type ServiceFormValues,
	serviceCategories,
} from "./service.types";
import { formatServiceCategory, toServicePayload } from "./service.utils";

type ServiceModalProps = {
	service: AdminService | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
};

export function ServiceModal({
	service,
	isOpen,
	onClose,
	onSuccess,
}: ServiceModalProps) {
	const submitControllerRef = useRef<AbortController | null>(null);
	const isEditing = service !== null;
	const formId = "service-form";
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ServiceFormValues>({
		defaultValues: { name: "", price: "", serviceCategory: "others" },
	});

	useEffect(() => {
		if (!isOpen) return;
		reset({
			name: service?.name ?? "",
			price: service ? String(service.price) : "",
			serviceCategory: service?.serviceCategory ?? "others",
		});
	}, [isOpen, service, reset]);

	useEffect(
		() => () => {
			submitControllerRef.current?.abort();
		},
		[],
	);

	async function handleSave(values: ServiceFormValues) {
		submitControllerRef.current?.abort();
		const controller = new AbortController();
		submitControllerRef.current = controller;

		try {
			const input = toServicePayload(values);
			if (service) {
				await updateAdminService(service.id, input, controller.signal);
			} else {
				await createAdminService(input, controller.signal);
			}
			onSuccess();
		} catch (requestError) {
			if (
				requestError instanceof DOMException &&
				requestError.name === "AbortError"
			)
				return;
			setError("root", {
				message:
					requestError instanceof HttpError
						? requestError.message
						: "Não foi possível salvar o serviço.",
			});
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			title={isEditing ? "Serviço" : "Cadastro de serviço"}
			onClose={isSubmitting ? () => undefined : onClose}
			footer={
				<>
					<Button
						variant="secondary"
						className="flex-1"
						disabled={isSubmitting}
						onClick={onClose}
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
			<form
				id={formId}
				className="flex flex-col gap-5"
				onSubmit={handleSubmit(handleSave)}
			>
				<Input
					label="Título"
					placeholder="Nome do serviço"
					error={errors.name?.message}
					{...register("name", {
						required: "Informe o título do serviço.",
						validate: (value) =>
							value.trim().length > 0 || "Informe o título do serviço.",
					})}
				/>
				<Input
					label="Valor"
					type="number"
					min="0.01"
					step="0.01"
					placeholder="0,00"
					error={errors.price?.message}
					{...register("price", {
						required: "Informe o valor do serviço.",
						validate: (value) =>
							Number(value) > 0 || "Informe um valor maior que zero.",
					})}
				/>
				<div className="flex flex-col gap-1">
					<label
						htmlFor="service-category"
						className="text-gray-300 text-xxs-bold"
					>
						Categoria
					</label>
					<select
						id="service-category"
						className="h-8 w-full border-gray-500 border-b bg-transparent text-gray-100 text-sm-regular outline-none transition-colors focus:border-brand-base"
						aria-invalid={Boolean(errors.serviceCategory)}
						{...register("serviceCategory", {
							required: "Selecione uma categoria.",
						})}
					>
						{serviceCategories.map((category) => (
							<option key={category} value={category}>
								{formatServiceCategory(category)}
							</option>
						))}
					</select>
					{errors.serviceCategory?.message ? (
						<p role="alert" className="text-danger text-xs-regular">
							{errors.serviceCategory.message}
						</p>
					) : null}
				</div>
				{errors.root?.message ? (
					<p role="alert" className="text-danger text-xs-regular">
						{errors.root.message}
					</p>
				) : null}
			</form>
		</Modal>
	);
}
