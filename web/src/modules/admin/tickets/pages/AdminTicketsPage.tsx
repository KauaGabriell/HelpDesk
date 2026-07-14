import { PencilLineIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../../components/ui/Avatar/Avatar";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { Pagination } from "../../../../components/ui/Pagination/Pagination";
import { getUploadUrl } from "../../../../lib/upload-url";
import { TicketStatusBadge } from "../TicketStatusBadge";
import { listAdminTickets } from "../ticket.api";
import type { AdminTicket } from "../ticket.types";
import {
	formatCurrency,
	formatDateTime,
	getTicketServiceName,
} from "../ticket.utils";

export function AdminTicketsPage() {
	const [tickets, setTickets] = useState<AdminTicket[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: retryKey intentionally re-runs the request.
	useEffect(() => {
		const controller = new AbortController();

		async function loadTickets() {
			try {
				setIsLoading(true);
				setError(null);
				const response = await listAdminTickets({
					page,
					signal: controller.signal,
				});
				setTickets(response.data);
				setTotalPages(response.pagination.totalPages);
			} catch (requestError) {
				if (
					requestError instanceof DOMException &&
					requestError.name === "AbortError"
				) {
					return;
				}
				setError("Não foi possível carregar os chamados.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}

		void loadTickets();
		return () => controller.abort();
	}, [page, retryKey]);

	return (
		<section className="mx-auto w-full max-w-267.5">
			<h1 className="mb-5 text-brand-dark text-xl-bold">Chamados</h1>

			{isLoading ? (
				<PageState type="loading" message="Carregando chamados..." />
			) : error ? (
				<PageState
					type="error"
					message={error}
					onRetry={() => setRetryKey((key) => key + 1)}
				/>
			) : tickets.length === 0 ? (
				<PageState type="empty" message="Nenhum chamado encontrado." />
			) : (
				<>
					<div className="overflow-hidden rounded-lg border border-gray-500 bg-gray-600">
						<table className="w-full table-fixed border-collapse text-left">
							<thead className="border-gray-500 border-b">
								<tr className="h-11 text-gray-400 text-xs-regular">
									<th className="w-[18%] px-2 font-normal md:w-[13%] md:px-3">
										<span className="md:hidden">Atualizado</span>
										<span className="hidden md:inline">Atualizado em</span>
									</th>
									<th className="hidden w-[7%] px-3 font-normal md:table-cell">
										Id
									</th>
									<th className="w-[47%] px-2 font-normal md:w-[25%] md:px-3">
										Título e Serviço
									</th>
									<th className="hidden w-[12%] px-3 font-normal md:table-cell">
										Valor total
									</th>
									<th className="hidden w-[14%] px-3 font-normal md:table-cell">
										Cliente
									</th>
									<th className="hidden w-[16%] px-3 font-normal md:table-cell">
										Técnico
									</th>
									<th className="w-[20%] px-2 font-normal md:w-[15%] md:px-3">
										Status
									</th>
									<th
										className="w-10 px-2 font-normal md:px-3"
										aria-label="Ações"
									/>
								</tr>
							</thead>
							<tbody className="text-gray-100 text-xs-regular">
								{tickets.map((ticket) => {
									const updatedAt = formatDateTime(ticket.updatedAt);
									return (
										<tr
											key={ticket.id}
											className="border-gray-500 border-b last:border-b-0"
										>
											<td className="px-2 py-3 align-middle text-xxs-bold md:px-3 md:text-xs-regular">
												<span className="block">{updatedAt.date}</span>
												<span className="block">{updatedAt.time}</span>
											</td>
											<td className="hidden px-3 text-xs-bold md:table-cell">
												{ticket.id.slice(0, 5)}
											</td>
											<td className="px-2 py-3 align-middle md:px-3">
												<strong className="block truncate text-xs-bold">
													{ticket.title}
												</strong>
												<span className="block truncate text-[10px] font-normal leading-[14px] md:text-xs-regular">
													{getTicketServiceName(ticket.ticketServices[0])}
												</span>
											</td>
											<td className="hidden px-3 md:table-cell">
												{formatCurrency(ticket.totalPrice)}
											</td>
											<td className="hidden px-3 md:table-cell">
												<span className="flex items-center gap-2">
													<Avatar
														name={ticket.client.name}
														src={getUploadUrl(
															ticket.client.clientProfile?.avatarUrl,
														)}
														size="sm"
													/>
													<span className="truncate">{ticket.client.name}</span>
												</span>
											</td>
											<td className="hidden px-3 md:table-cell">
												<span className="flex items-center gap-2">
													<Avatar
														name={ticket.technician.name}
														src={getUploadUrl(
															ticket.technician.technicianProfile?.avatarUrl,
														)}
														size="sm"
													/>
													<span className="truncate">
														{ticket.technician.name}
													</span>
												</span>
											</td>
											<td className="px-2 py-3 md:px-3">
												<TicketStatusBadge status={ticket.status} compact />
											</td>
											<td className="px-2 py-3">
												<Link
													to={`/admin/tickets/${ticket.id}`}
													className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-gray-500 text-gray-300 transition-colors hover:bg-gray-400 hover:text-gray-100"
													aria-label={`Ver chamado ${ticket.title}`}
												>
													<PencilLineIcon
														className="h-3.5 w-3.5"
														aria-hidden="true"
													/>
												</Link>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
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
