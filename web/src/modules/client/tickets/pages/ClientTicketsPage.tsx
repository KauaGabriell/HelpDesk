import { EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../../components/ui/Avatar/Avatar";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { Pagination } from "../../../../components/ui/Pagination/Pagination";
import { getUploadUrl } from "../../../../lib/upload-url";
import { ClientTicketStatusBadge } from "../ClientTicketStatusBadge";
import { listClientTickets } from "../client-ticket.api";
import type { ClientTicketListItem } from "../client-ticket.types";
import {
	formatClientCurrency,
	formatClientDateTime,
} from "../client-ticket.utils";
import { getClientTicketServiceName } from "../client-ticket.view-utils";

export function ClientTicketsPage() {
	const [tickets, setTickets] = useState<ClientTicketListItem[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);

	useEffect(() => {
		void retryKey;
		const controller = new AbortController();

		async function loadTickets() {
			try {
				setIsLoading(true);
				setError(null);
				const response = await listClientTickets({
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
			<h1 className="mb-6 text-brand-dark text-xl-bold">Meus chamados</h1>
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
					<div className="w-full overflow-x-auto rounded-lg border border-gray-500">
						<table className="w-full min-w-112.5 table-fixed border-collapse text-left md:min-w-175">
							<thead className="border-gray-500 border-b">
								<tr className="h-11 text-gray-400 text-xs-regular">
									<th className="w-20 px-2 font-normal md:w-25 md:px-3">
										Atualizado em
									</th>
									<th className="hidden w-12 px-3 font-normal md:table-cell">
										Id
									</th>
									<th className="w-45 px-3 font-normal">Título</th>
									<th className="hidden w-40 px-3 font-normal md:table-cell">
										Serviço
									</th>
									<th className="hidden w-25 px-3 font-normal md:table-cell">
										Valor total
									</th>
									<th className="hidden w-35 px-3 font-normal md:table-cell">
										Técnico
									</th>
									<th className="w-18 px-1 font-normal md:w-30 md:px-3">
										Status
									</th>
									<th className="w-10 px-1 md:w-12 md:px-2" aria-label="Ação" />
								</tr>
							</thead>
							<tbody>
								{tickets.map((ticket) => {
									const primaryService = ticket.ticketServices[0];
									return (
										<tr
											key={ticket.id}
											className="h-15 border-gray-500 border-b last:border-b-0"
										>
											<td className="px-2 text-gray-300 text-xs-regular md:px-3">
												{formatClientDateTime(ticket.updatedAt)}
											</td>
											<td className="hidden px-3 text-gray-100 text-xs-bold md:table-cell">
												{ticket.id.slice(0, 5)}
											</td>
											<td className="px-2 md:px-3">
												<p className="truncate text-gray-100 text-xs-bold">
													{ticket.title}
												</p>
												<p className="truncate text-gray-300 text-xxs-regular md:hidden">
													{primaryService
														? getClientTicketServiceName(primaryService)
														: "Sem serviço"}
												</p>
											</td>
											<td className="hidden px-3 text-gray-300 text-xs-regular md:table-cell">
												<span className="truncate">
													{primaryService
														? getClientTicketServiceName(primaryService)
														: "Sem serviço"}
												</span>
											</td>
											<td className="hidden px-3 text-gray-100 text-xs-bold md:table-cell">
												{formatClientCurrency(ticket.totalPrice)}
											</td>
											<td className="hidden px-3 md:table-cell">
												<div className="flex min-w-0 items-center gap-2">
													<Avatar
														name={ticket.technician.name}
														src={getUploadUrl(
															ticket.technician.technicianProfile?.avatarUrl,
														)}
														size="sm"
													/>
													<span className="truncate text-gray-300 text-xs-regular">
														{ticket.technician.name}
													</span>
												</div>
											</td>
											<td className="px-1 md:px-3">
												<ClientTicketStatusBadge status={ticket.status} />
											</td>
											<td className="px-1 md:px-2">
												<Link
													to={`/client/tickets/${ticket.id}`}
													className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-gray-500 text-gray-300 hover:bg-gray-400 hover:text-gray-100 md:h-8 md:w-8"
													aria-label={`Ver chamado ${ticket.title}`}
												>
													<EyeIcon className="h-4 w-4" />
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
