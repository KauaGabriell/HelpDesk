import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/Button/Button";
import { Input } from "../../../../components/ui/Input/Input";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { HttpError } from "../../../../lib/http-error";
import { createClientTicket, listActiveServices } from "../client-ticket.api";
import type { ActiveService } from "../client-ticket.types";
import {
	type CreateClientTicketFormValues,
	formatClientCurrency,
	toCreateClientTicketPayload,
} from "../client-ticket.utils";
import { formatClientServiceCategory } from "../client-ticket.view-utils";

export function CreateClientTicketPage() {
	const navigate = useNavigate();
	const [services, setServices] = useState<ActiveService[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	const {
		register,
		handleSubmit,
		watch,
		setError: setFormError,
		formState: { errors, isSubmitting },
	} = useForm<CreateClientTicketFormValues>({
		defaultValues: { title: "", description: "", serviceId: "" },
	});
	const selectedServiceId = watch("serviceId");
	const selectedService = useMemo(
		() => services.find((service) => service.id === selectedServiceId),
		[services, selectedServiceId],
	);

	useEffect(() => {
		void retryKey;
		const controller = new AbortController();
		async function loadServices() {
			try {
				setIsLoading(true);
				setError(null);
				setServices(await listActiveServices(controller.signal));
			} catch (requestError) {
				if (
					requestError instanceof DOMException &&
					requestError.name === "AbortError"
				)
					return;
				setError("Não foi possível carregar os serviços.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}
		void loadServices();
		return () => controller.abort();
	}, [retryKey]);

	async function handleCreate(values: CreateClientTicketFormValues) {
		try {
			await createClientTicket(toCreateClientTicketPayload(values));
			navigate("/client/tickets", { replace: true });
		} catch (requestError) {
			setFormError("root", {
				message:
					requestError instanceof HttpError
						? requestError.message
						: "Não foi possível criar o chamado.",
			});
		}
	}

	if (isLoading)
		return <PageState type="loading" message="Carregando serviços..." />;
	if (error)
		return (
			<PageState
				type="error"
				message={error}
				onRetry={() => setRetryKey((key) => key + 1)}
			/>
		);

	return (
		<section className="mx-auto w-full max-w-150">
			<h1 className="mb-6 text-brand-dark text-xl-bold">Novo chamado</h1>
			<div className="grid items-start gap-5 md:grid-cols-[1.5fr_0.9fr]">
				<form
					className="rounded-lg border border-gray-500 p-5"
					onSubmit={handleSubmit(handleCreate)}
				>
					<h2 className="text-gray-100 text-sm-bold">Informações</h2>
					<p className="mt-1 text-gray-400 text-xs-regular">
						Descreva o problema para atendimento.
					</p>
					<div className="mt-6 flex flex-col gap-5">
						<Input
							label="Título"
							placeholder="Digite um título para o chamado"
							error={errors.title?.message}
							{...register("title", {
								required: "Informe o título.",
								validate: (value) =>
									value.trim().length > 0 || "Informe o título.",
							})}
						/>
						<div className="flex flex-col gap-1">
							<label
								htmlFor="ticket-description"
								className="text-gray-300 text-xxs-bold"
							>
								Descrição
							</label>
							<textarea
								id="ticket-description"
								rows={5}
								className="w-full resize-y border-gray-500 border-b bg-transparent py-1 text-gray-100 text-sm-regular outline-none placeholder:text-gray-400 focus:border-brand-base"
								placeholder="Descreva o que está acontecendo"
								{...register("description")}
							/>
						</div>
						<div className="border-gray-500 border-t pt-5">
							<label
								htmlFor="service-id"
								className="text-gray-300 text-xxs-bold"
							>
								Categoria de serviço
							</label>
							<select
								id="service-id"
								className="mt-2 w-full border-gray-500 border-b bg-transparent py-2 text-gray-100 text-sm-regular outline-none focus:border-brand-base"
								{...register("serviceId", {
									required: "Selecione um serviço.",
								})}
							>
								<option value="">Selecione o serviço de atendimento</option>
								{services.map((service) => (
									<option key={service.id} value={service.id}>
										{service.name}
									</option>
								))}
							</select>
							{errors.serviceId?.message ? (
								<p className="mt-2 text-danger text-xs-regular">
									{errors.serviceId.message}
								</p>
							) : null}
						</div>
						{errors.root?.message ? (
							<p role="alert" className="text-danger text-xs-regular">
								{errors.root.message}
							</p>
						) : null}
					</div>
					<Button
						type="submit"
						className="mt-6 w-full md:hidden"
						disabled={isSubmitting || services.length === 0}
					>
						{isSubmitting ? "Criando..." : "Criar chamado"}
					</Button>
				</form>
				<aside className="rounded-lg border border-gray-500 p-5">
					<h2 className="text-gray-100 text-sm-bold">Resumo</h2>
					<p className="mt-1 text-gray-400 text-xs-regular">
						Valores e detalhes
					</p>
					<div className="mt-6 space-y-4 text-xs-regular">
						<div>
							<p className="text-gray-400 text-xxs-bold">
								Categoria de serviço
							</p>
							<p className="mt-1 text-gray-100">
								{formatClientServiceCategory(selectedService?.serviceCategory)}
							</p>
						</div>
						<div>
							<p className="text-gray-400 text-xxs-bold">Custo inicial</p>
							<p className="mt-1 text-gray-100 text-lg-bold">
								{selectedService
									? formatClientCurrency(selectedService.price)
									: "R$ 0,00"}
							</p>
						</div>
						<p className="text-gray-300">
							O chamado será automaticamente atribuído a um técnico disponível.
						</p>
					</div>
					<Button
						type="submit"
						className="mt-6 hidden w-full md:inline-flex"
						disabled={isSubmitting || !selectedService}
						onClick={handleSubmit(handleCreate)}
					>
						{isSubmitting ? "Criando..." : "Criar chamado"}
					</Button>
				</aside>
			</div>
		</section>
	);
}
