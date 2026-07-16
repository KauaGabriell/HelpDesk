import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../../../../components/ui/Avatar/Avatar";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { getUploadUrl } from "../../../../lib/upload-url";
import { ClientTicketStatusBadge } from "../ClientTicketStatusBadge";
import { getClientTicket } from "../client-ticket.api";
import type { ClientTicketDetails } from "../client-ticket.types";
import {
	formatClientCurrency,
	formatClientDateTime,
} from "../client-ticket.utils";
import {
	formatClientServiceCategory,
	getClientTicketServiceName,
} from "../client-ticket.view-utils";

export function ClientTicketDetailsPage() {
	const { ticketId } = useParams();
	const navigate = useNavigate();
	const [ticket, setTicket] = useState<ClientTicketDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);

	useEffect(() => {
		if (!ticketId) return;
		void retryKey;
		const currentTicketId = ticketId;
		const controller = new AbortController();

		async function loadTicket() {
			try {
				setIsLoading(true);
				setError(null);
				setTicket(await getClientTicket(currentTicketId, controller.signal));
			} catch (requestError) {
				if (
					requestError instanceof DOMException &&
					requestError.name === "AbortError"
				) {
					return;
				}
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

	if (isLoading)
		return <PageState type="loading" message="Carregando chamado..." />;
	if (!ticket) {
		return (
			<PageState
				type="error"
				message={error ?? "Chamado não encontrado."}
				onRetry={() => setRetryKey((key) => key + 1)}
			/>
		);
	}

	return (
		<section className="mx-auto w-full max-w-232.5">
			<button
				type="button"
				className="mb-2 inline-flex items-center gap-2 text-gray-300 text-xs-regular hover:text-gray-100"
				onClick={() => navigate("/client/tickets")}
			>
				<ArrowLeftIcon className="h-4 w-4" /> Voltar
			</button>
			<h1 className="mb-5 text-brand-dark text-xl-bold">Chamado detalhado</h1>
			<div className="grid items-start gap-5 lg:grid-cols-[1.4fr_0.9fr]">
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
						<ClientTicketStatusBadge status={ticket.status} />
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
								{formatClientServiceCategory(
									baseServices[0]?.service?.serviceCategory,
								)}
							</p>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-gray-400 text-xxs-bold">Criado em</p>
								<p className="mt-1 text-gray-100">
									{formatClientDateTime(ticket.createdAt)}
								</p>
							</div>
							<div>
								<p className="text-gray-400 text-xxs-bold">Atualizado em</p>
								<p className="mt-1 text-gray-100">
									{formatClientDateTime(ticket.updatedAt)}
								</p>
							</div>
						</div>
					</div>
				</section>
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
							<span>{formatClientCurrency(basePrice)}</span>
						</div>
						<div>
							<p className="mb-2 text-gray-400 text-xxs-bold">Adicionais</p>
							{additionalServices.length ? (
								additionalServices.map((service) => (
									<div
										key={`${service.title}-${service.price}-${service.description ?? ""}`}
										className="flex justify-between gap-3 py-1 text-gray-300"
									>
										<span className="truncate">
											{getClientTicketServiceName(service)}
										</span>
										<span className="shrink-0">
											{formatClientCurrency(service.price)}
										</span>
									</div>
								))
							) : (
								<p className="text-gray-300">Sem adicionais.</p>
							)}
						</div>
						<div className="flex justify-between gap-3 border-gray-500 border-t pt-3 text-gray-100 text-sm-bold">
							<span>Total</span>
							<span>{formatClientCurrency(ticket.totalPrice)}</span>
						</div>
					</div>
				</aside>
			</div>
		</section>
	);
}
