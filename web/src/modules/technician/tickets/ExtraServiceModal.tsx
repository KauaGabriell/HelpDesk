import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { Modal } from "../../../components/ui/Modal/Modal";
import { HttpError } from "../../../lib/http-error";
import { addTechnicianExtraService } from "./technician-ticket.api";
import type {
	ExtraServiceFormValues,
	TechnicianTicketService,
} from "./technician-ticket.types";
import { toExtraServicePayload } from "./technician-ticket.utils";

type ExtraServiceModalProps = {
	ticketId: string;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (service: TechnicianTicketService) => void;
};

export function ExtraServiceModal({
	ticketId,
	isOpen,
	onClose,
	onSuccess,
}: ExtraServiceModalProps) {
	const controllerRef = useRef<AbortController | null>(null);
	const formId = "extra-service-form";
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ExtraServiceFormValues>({
		defaultValues: { title: "", description: "", price: "" },
	});

	useEffect(
		() => () => {
			controllerRef.current?.abort();
		},
		[],
	);

	async function handleAdd(values: ExtraServiceFormValues) {
		controllerRef.current?.abort();
		const controller = new AbortController();
		controllerRef.current = controller;

		try {
			const input = toExtraServicePayload(values);
			await addTechnicianExtraService(ticketId, input, controller.signal);
			onSuccess({
				title: input.title,
				description: input.description ?? null,
				price: input.price,
				service: null,
			});
			reset();
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
						: "Não foi possível adicionar o serviço.",
			});
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			title="Serviço adicional"
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
				onSubmit={handleSubmit(handleAdd)}
			>
				<Input
					label="Título"
					placeholder="Nome do serviço"
					error={errors.title?.message}
					{...register("title", {
						required: "Informe o título do serviço.",
						validate: (value) =>
							value.trim().length > 0 || "Informe o título do serviço.",
					})}
				/>
				<div className="flex flex-col gap-1">
					<label
						htmlFor="extra-description"
						className="text-gray-300 text-xxs-bold"
					>
						Descrição
					</label>
					<textarea
						id="extra-description"
						rows={3}
						className="w-full resize-y border-gray-500 border-b bg-transparent py-1 text-gray-100 text-sm-regular outline-none placeholder:text-gray-400 focus:border-brand-base"
						placeholder="Descreva o serviço adicional"
						{...register("description")}
					/>
				</div>
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
				{errors.root?.message ? (
					<p role="alert" className="text-danger text-xs-regular">
						{errors.root.message}
					</p>
				) : null}
			</form>
		</Modal>
	);
}
