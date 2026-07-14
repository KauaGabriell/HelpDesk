import { ArrowLeftIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../../../../components/ui/Avatar/Avatar";
import { Button } from "../../../../components/ui/Button/Button";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { HttpError } from "../../../../lib/http-error";
import { getUploadUrl } from "../../../../lib/upload-url";
import { TicketStatusBadge } from "../TicketStatusBadge";
import { getAdminTicketDetails, updateAdminTicketStatus } from "../ticket.api";
import type { AdminTicketDetails, TicketStatus } from "../ticket.types";
import {
	formatCurrency,
	formatDateTime,
	getAdditionalServices,
	getBasePrice,
	getTicketCategory,
} from "../ticket.utils";

export function AdminTicketDetailsPage() {
	const { ticketId } = useParams();
	const navigate = useNavigate();
	const [ticket, setTicket] = useState<AdminTicketDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mutationError, setMutationError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	const mutationControllerRef = useRef<AbortController>(null);

	useEffect(
		() => () => {
			mutationControllerRef.current?.abort();
		},
		[],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: retryKey intentionally re-runs the request.
	useEffect(() => {
		if (!ticketId) return;
		const controller = new AbortController();

		async function loadTicket() {
			try {
				setIsLoading(true);
				setError(null);
				setTicket(
					await getAdminTicketDetails(ticketId as string, controller.signal),
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

	async function changeStatus(status: TicketStatus) {
		if (!ticketId || !ticket) return;
		mutationControllerRef.current?.abort();
		const controller = new AbortController();
		mutationControllerRef.current = controller;
		try {
			setIsUpdating(true);
			setMutationError(null);
			const updatedTicket = await updateAdminTicketStatus(
				ticketId,
				status,
				controller.signal,
			);
			setTicket((current) =>
				current ? { ...current, status: updatedTicket.status } : current,
			);
		} catch (requestError) {
			if (
				requestError instanceof DOMException &&
				requestError.name === "AbortError"
			)
				return;
			setMutationError(
				requestError instanceof HttpError
					? requestError.message
					: "Não foi possível alterar o status.",
			);
		} finally {
			if (!controller.signal.aborted) setIsUpdating(false);
		}
	}

	if (isLoading)
		return <PageState type="loading" message="Carregando chamado..." />;
	if (error || !ticket) {
		return (
			<PageState
				type="error"
				message={error ?? "Chamado não encontrado."}
				onRetry={() => setRetryKey((key) => key + 1)}
			/>
		);
	}

	const createdAt = formatDateTime(ticket.createdAt);
	const updatedAt = formatDateTime(ticket.updatedAt);
	const additionalServices = getAdditionalServices(ticket.ticketServices);

	return (
		<section className="mx-auto w-full max-w-185">
			<button
				type="button"
				className="mb-2 inline-flex items-center gap-2 text-gray-300 text-xs-regular hover:text-gray-100"
				onClick={() => navigate("/admin/tickets")}
			>
				<ArrowLeftIcon className="h-4 w-4" /> Voltar
			</button>

			<header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<h1 className="text-brand-dark text-xl-bold">Chamado detalhado</h1>
				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="secondary"
						size="sm"
						icon={<ClockIcon />}
						disabled={ticket.status !== "open" || isUpdating}
						onClick={() => void changeStatus("in_progress")}
					>
						Em atendimento
					</Button>
					<Button
						variant="secondary"
						size="sm"
						icon={<CheckCircleIcon />}
						disabled={ticket.status !== "in_progress" || isUpdating}
						onClick={() => void changeStatus("closed")}
					>
						Encerrado
					</Button>
				</div>
			</header>

			{mutationError ? (
				<div
					className="mb-4 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-danger text-xs-bold"
					role="alert"
				>
					{mutationError}
				</div>
			) : null}

			<div className="grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
				<article className="rounded-lg border border-gray-500 p-5">
					<div className="mb-4 flex items-start justify-between gap-4">
						<div>
							<span className="text-gray-400 text-xs-bold">
								{ticket.id.slice(0, 5)}
							</span>
							<h2 className="mt-1 text-gray-100 heading-md-bold">
								{ticket.title}
							</h2>
						</div>
						<TicketStatusBadge status={ticket.status} />
					</div>
					<dl className="grid gap-5 text-gray-200 text-xs-regular md:grid-cols-2">
						<div className="md:col-span-2">
							<dt className="mb-1 text-gray-400 text-xxs-bold">Descrição</dt>
							<dd>{ticket.description || "Sem descrição"}</dd>
						</div>
						<div className="md:col-span-2">
							<dt className="mb-1 text-gray-400 text-xxs-bold">Categoria</dt>
							<dd>{getTicketCategory(ticket.ticketServices)}</dd>
						</div>
						<div>
							<dt className="mb-1 text-gray-400 text-xxs-bold">Criado em</dt>
							<dd>
								{createdAt.date} {createdAt.time}
							</dd>
						</div>
						<div>
							<dt className="mb-1 text-gray-400 text-xxs-bold">
								Atualizado em
							</dt>
							<dd>
								{updatedAt.date} {updatedAt.time}
							</dd>
						</div>
						<div className="md:col-span-2">
							<dt className="mb-2 text-gray-400 text-xxs-bold">Cliente</dt>
							<dd className="flex items-center gap-2">
								<Avatar
									name={ticket.client.name}
									src={getUploadUrl(ticket.client.clientProfile?.avatarUrl)}
									size="sm"
								/>
								<span className="text-xs-bold">{ticket.client.name}</span>
							</dd>
						</div>
					</dl>
				</article>

				<aside className="rounded-lg border border-gray-500 p-5">
					<p className="mb-3 text-gray-400 text-xxs-bold">
						Técnico responsável
					</p>
					<div className="mb-7 flex items-center gap-3">
						<Avatar
							name={ticket.technician.name}
							src={getUploadUrl(ticket.technician.technicianProfile?.avatarUrl)}
							size="md"
						/>
						<div className="min-w-0">
							<p className="truncate text-gray-100 text-xs-bold">
								{ticket.technician.name}
							</p>
							<p className="truncate text-gray-400 text-xxs">
								{ticket.technician.email}
							</p>
						</div>
					</div>
					<p className="mb-2 text-gray-400 text-xxs-bold">Valores</p>
					<dl className="flex flex-col gap-2 text-gray-200 text-xs-regular">
						<div className="flex justify-between gap-4">
							<dt>Preço base</dt>
							<dd>{formatCurrency(getBasePrice(ticket.ticketServices))}</dd>
						</div>
						{additionalServices.length > 0 ? (
							<dt className="mt-2 text-gray-400 text-xxs-bold">Adicionais</dt>
						) : null}
						{additionalServices.map((service) => (
							<div
								className="flex justify-between gap-4"
								key={`${service.title}-${service.price}-${service.description ?? ""}`}
							>
								<dt>{service.title ?? "Serviço adicional"}</dt>
								<dd>{formatCurrency(service.price)}</dd>
							</div>
						))}
						<div className="mt-3 flex justify-between border-gray-500 border-t pt-3 text-sm-bold">
							<dt>Total</dt>
							<dd>{formatCurrency(ticket.totalPrice)}</dd>
						</div>
					</dl>
				</aside>
			</div>
		</section>
	);
}
