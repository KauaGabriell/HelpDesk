import { useEffect, useRef, useState } from "react";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { Pagination } from "../../../../components/ui/Pagination/Pagination";
import { HttpError } from "../../../../lib/http-error";
import { TechnicianTicketCard } from "../TechnicianTicketCard";
import { TechnicianTicketStatusBadge } from "../TechnicianTicketStatusBadge";
import {
	closeTechnicianTicket,
	listTechnicianTickets,
	startTechnicianTicket,
} from "../technician-ticket.api";
import type {
	TechnicianTicketListItem,
	TechnicianTicketStatus,
} from "../technician-ticket.types";
import { groupTechnicianTicketsByStatus } from "../technician-ticket.utils";

const technicianTicketStatusOrder: TechnicianTicketStatus[] = [
	"in_progress",
	"open",
	"closed",
];

export function TechnicianTicketsPage() {
	const [tickets, setTickets] = useState<TechnicianTicketListItem[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
	const actionControllerRef = useRef<AbortController | null>(null);

	useEffect(
		() => () => {
			actionControllerRef.current?.abort();
		},
		[],
	);

	useEffect(() => {
		void retryKey;
		const controller = new AbortController();

		async function loadTickets() {
			try {
				setIsLoading(true);
				setError(null);
				const response = await listTechnicianTickets({
					page,
					signal: controller.signal,
				});
				setTickets(response.data);
				setTotalPages(response.pagination.totalPages);
			} catch (requestError) {
				if (
					requestError instanceof DOMException &&
					requestError.name === "AbortError"
				)
					return;
				setError("Não foi possível carregar os chamados.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}

		void loadTickets();
		return () => controller.abort();
	}, [page, retryKey]);

	async function handleStatusAction(
		ticket: TechnicianTicketListItem,
		action: "start" | "close",
	) {
		actionControllerRef.current?.abort();
		const controller = new AbortController();
		actionControllerRef.current = controller;
		setUpdatingTicketId(ticket.id);
		setError(null);

		try {
			const updated =
				action === "start"
					? await startTechnicianTicket(ticket.id, controller.signal)
					: await closeTechnicianTicket(ticket.id, controller.signal);
			setTickets((currentTickets) =>
				currentTickets.map((currentTicket) =>
					currentTicket.id === updated.id
						? { ...currentTicket, status: updated.status }
						: currentTicket,
				),
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
			if (!controller.signal.aborted) setUpdatingTicketId(null);
		}
	}

	const groups = groupTechnicianTicketsByStatus(tickets);

	return (
		<section className="mx-auto w-full max-w-267.5">
			<h1 className="mb-6 text-brand-dark text-xl-bold">Meus chamados</h1>
			{error ? (
				<p role="alert" className="mb-4 text-danger text-xs-bold">
					{error}
				</p>
			) : null}

			{isLoading ? (
				<PageState type="loading" message="Carregando chamados..." />
			) : error && tickets.length === 0 ? (
				<PageState
					type="error"
					message={error}
					onRetry={() => setRetryKey((key) => key + 1)}
				/>
			) : tickets.length === 0 ? (
				<PageState type="empty" message="Nenhum chamado encontrado." />
			) : (
				<>
					<div className="flex flex-col gap-6">
						{technicianTicketStatusOrder.map((status) => {
							const statusTickets = groups[status];
							if (statusTickets.length === 0) return null;

							return (
								<section key={status}>
									<header className="mb-3">
										<TechnicianTicketStatusBadge status={status} />
									</header>
									<div className="grid gap-3 md:grid-cols-3">
										{statusTickets.map((ticket) => (
											<TechnicianTicketCard
												key={ticket.id}
												ticket={ticket}
												isUpdating={updatingTicketId === ticket.id}
												onStart={(selectedTicket) =>
													void handleStatusAction(selectedTicket, "start")
												}
												onClose={(selectedTicket) =>
													void handleStatusAction(selectedTicket, "close")
												}
											/>
										))}
									</div>
								</section>
							);
						})}
					</div>
					<Pagination
						currentPage={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</>
			)}
		</section>
	);
}
