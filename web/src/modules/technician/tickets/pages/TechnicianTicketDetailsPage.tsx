import {
	ArrowLeftIcon,
	CheckCircleIcon,
	CirclePlusIcon,
	PlayCircleIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../../../../components/ui/Avatar/Avatar";
import { Button } from "../../../../components/ui/Button/Button";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { HttpError } from "../../../../lib/http-error";
import { getUploadUrl } from "../../../../lib/upload-url";
import { ExtraServiceModal } from "../ExtraServiceModal";
import { TechnicianTicketStatusBadge } from "../TechnicianTicketStatusBadge";
import {
	closeTechnicianTicket,
	getTechnicianTicket,
	startTechnicianTicket,
} from "../technician-ticket.api";
import type {
	TechnicianTicketDetails,
	TechnicianTicketService,
} from "../technician-ticket.types";
import {
	formatTechnicianCurrency,
	formatTechnicianDateTime,
	getTechnicianTicketServiceName,
} from "../technician-ticket.utils";

export function TechnicianTicketDetailsPage() {
	const { ticketId } = useParams();
	const navigate = useNavigate();
	const [ticket, setTicket] = useState<TechnicianTicketDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isExtraServiceOpen, setIsExtraServiceOpen] = useState(false);
	const actionControllerRef = useRef<AbortController | null>(null);

	useEffect(
		() => () => {
			actionControllerRef.current?.abort();
		},
		[],
	);

	useEffect(() => {
		if (!ticketId) return;
		void retryKey;
		const currentTicketId = ticketId;
		const controller = new AbortController();

		async function loadTicket() {
			try {
				setIsLoading(true);
				setError(null);
				setTicket(
					await getTechnicianTicket(currentTicketId, controller.signal),
				);
			} catch (requestError) {
				if (
					requestError instanceof DOMException &&
					requestError.name === "AbortError"
				)
					return;
				setError("Não foi possível carregar o chamado.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}

		void loadTicket();
		return () => controller.abort();
	}, [ticketId, retryKey]);

	const baseServices = useMemo(
		() =>
			ticket?.ticketServices.filter((service) => service.service !== null) ??
			[],
		[ticket],
	);
	const additionalServices = useMemo(
		() =>
			ticket?.ticketServices.filter((service) => service.service === null) ??
			[],
		[ticket],
	);
	const basePrice = useMemo(
		() =>
			baseServices.reduce((total, service) => total + Number(service.price), 0),
		[baseServices],
	);

	async function handleStatusAction(action: "start" | "close") {
		if (!ticket) return;
		actionControllerRef.current?.abort();
		const controller = new AbortController();
		actionControllerRef.current = controller;
		setIsUpdating(true);
		setError(null);

		try {
			const updated =
				action === "start"
					? await startTechnicianTicket(ticket.id, controller.signal)
					: await closeTechnicianTicket(ticket.id, controller.signal);
			setTicket((currentTicket) =>
				currentTicket ? { ...currentTicket, status: updated.status } : null,
			);
		} catch (requestError) {
			if (
				requestError instanceof DOMException &&
				requestError.name === "AbortError"
			)
				return;
			setError(
				requestError instanceof HttpError
					? requestError.message
					: "Não foi possível atualizar o chamado.",
			);
		} finally {
			if (!controller.signal.aborted) setIsUpdating(false);
		}
	}

	function handleExtraServiceSuccess(service: TechnicianTicketService) {
		setTicket((currentTicket) =>
			currentTicket
				? {
						...currentTicket,
						ticketServices: [...currentTicket.ticketServices, service],
						totalPrice: currentTicket.totalPrice + Number(service.price),
					}
				: null,
		);
		setIsExtraServiceOpen(false);
	}

	if (isLoading)
		return <PageState type="loading" message="Carregando chamado..." />;
	if (!ticket)
		return (
			<PageState
				type="error"
				message={error ?? "Chamado não encontrado."}
				onRetry={() => setRetryKey((key) => key + 1)}
			/>
		);

	return (
		<section className="mx-auto w-full max-w-232.5">
			<button
				type="button"
				className="mb-2 inline-flex items-center gap-2 text-gray-300 text-xs-regular hover:text-gray-100"
				onClick={() => navigate("/technician/tickets")}
			>
				<ArrowLeftIcon className="h-4 w-4" /> Voltar
			</button>
			<header className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<h1 className="text-brand-dark text-xl-bold">Chamado detalhado</h1>
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="secondary"
						icon={<CheckCircleIcon />}
						disabled={ticket.status !== "in_progress" || isUpdating}
						onClick={() => void handleStatusAction("close")}
					>
						Encerrar
					</Button>
					<Button
						icon={<PlayCircleIcon />}
						disabled={ticket.status !== "open" || isUpdating}
						onClick={() => void handleStatusAction("start")}
					>
						Iniciar atendimento
					</Button>
				</div>
			</header>

			{error ? (
				<p role="alert" className="mb-4 text-danger text-xs-bold">
					{error}
				</p>
			) : null}

			<div className="grid items-start gap-5 lg:grid-cols-[1.4fr_0.9fr]">
				<div className="flex flex-col gap-5">
					<section className="rounded-lg border border-gray-500 p-5">
						<div className="flex items-start justify-between gap-4">
							<div>
								<span className="text-gray-400 text-xxs-bold">
									{ticket.id.slice(0, 5)}
								</span>
								<h2 className="mt-1 text-gray-100 text-lg-bold">
									{ticket.title}
								</h2>
							</div>
							<TechnicianTicketStatusBadge status={ticket.status} />
						</div>
						<div className="mt-5 space-y-4 text-xs-regular">
							<div>
								<p className="text-gray-400 text-xxs-bold">Descrição</p>
								<p className="mt-1 text-gray-100">
									{ticket.description ?? "Sem descrição."}
								</p>
							</div>
							<div>
								<p className="text-gray-400 text-xxs-bold">Categoria</p>
								<p className="mt-1 text-gray-100">
									{baseServices[0]?.service?.serviceCategory ?? "Sem categoria"}
								</p>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-gray-400 text-xxs-bold">Criado em</p>
									<p className="mt-1 text-gray-100">
										{formatTechnicianDateTime(ticket.createdAt)}
									</p>
								</div>
								<div>
									<p className="text-gray-400 text-xxs-bold">Atualizado em</p>
									<p className="mt-1 text-gray-100">
										{formatTechnicianDateTime(ticket.updatedAt)}
									</p>
								</div>
							</div>
							<div>
								<p className="text-gray-400 text-xxs-bold">Cliente</p>
								<div className="mt-2 flex items-center gap-2 text-gray-100">
									<Avatar
										name={ticket.client.name}
										src={getUploadUrl(ticket.client.clientProfile?.avatarUrl)}
										size="sm"
									/>
									{ticket.client.name}
								</div>
							</div>
						</div>
					</section>

					<section className="rounded-lg border border-gray-500 p-5">
						<header className="flex items-center justify-between">
							<h2 className="text-gray-300 text-xs-bold">
								Serviços adicionais
							</h2>
							{ticket.status === "in_progress" ? (
								<Button
									size="sm"
									iconOnly
									icon={<CirclePlusIcon />}
									aria-label="Adicionar serviço adicional"
									onClick={() => setIsExtraServiceOpen(true)}
								/>
							) : null}
						</header>
						{additionalServices.length === 0 ? (
							<p className="mt-4 text-gray-400 text-xs-regular">
								Nenhum serviço adicional.
							</p>
						) : (
							<ul className="mt-4 divide-y divide-gray-500">
								{additionalServices.map((service) => (
									<li
										key={`${service.title}-${service.price}-${service.description ?? ""}`}
										className="flex items-center justify-between gap-3 py-3 text-xs-regular"
									>
										<span className="min-w-0 truncate text-gray-100">
											{getTechnicianTicketServiceName(service)}
										</span>
										<span className="shrink-0 text-gray-300">
											{formatTechnicianCurrency(service.price)}
										</span>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>

				<aside className="rounded-lg border border-gray-500 p-5">
					<h2 className="text-gray-400 text-xxs-bold">Técnico responsável</h2>
					<div className="mt-3 flex items-center gap-3">
						<Avatar
							name={ticket.technician.name}
							src={getUploadUrl(ticket.technician.technicianProfile?.avatarUrl)}
							size="md"
						/>
						<div className="min-w-0">
							<p className="truncate text-gray-100 text-xs-bold">
								{ticket.technician.name}
							</p>
							<p className="truncate text-gray-400 text-xs-regular">
								{ticket.technician.email}
							</p>
						</div>
					</div>
					<div className="mt-6 space-y-3 border-gray-500 border-t pt-4 text-xs-regular">
						<div className="flex justify-between gap-3 text-gray-300">
							<span>Preço base</span>
							<span>{formatTechnicianCurrency(basePrice)}</span>
						</div>
						<div className="flex justify-between gap-3 text-gray-300">
							<span>Adicionais</span>
							<span>
								{formatTechnicianCurrency(ticket.totalPrice - basePrice)}
							</span>
						</div>
						<div className="flex justify-between gap-3 border-gray-500 border-t pt-3 text-gray-100 text-sm-bold">
							<span>Total</span>
							<span>{formatTechnicianCurrency(ticket.totalPrice)}</span>
						</div>
					</div>
				</aside>
			</div>

			<ExtraServiceModal
				ticketId={ticket.id}
				isOpen={isExtraServiceOpen}
				onClose={() => setIsExtraServiceOpen(false)}
				onSuccess={handleExtraServiceSuccess}
			/>
		</section>
	);
}
