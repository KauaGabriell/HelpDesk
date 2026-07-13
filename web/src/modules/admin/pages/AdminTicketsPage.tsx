import { PencilLineIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "../../../components/ui/Avatar/Avatar";
import { Badge } from "../../../components/ui/Badge/Badge";
import { getUploadUrl } from "../../../lib/upload-url";
import { listAdminTickets } from "../api/admin.tickets.api";
import type { AdminTicket } from "../types/admin-tickets.types";

export function AdminTicketsPage() {
	const [tickets, setTickets] = useState<AdminTicket[]>([]);
	const [_isLoading, setIsLoading] = useState(true);
	const [_error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadTickets() {
			try {
				setIsLoading(true);
				setError(null);

				const response = await listAdminTickets();
				setTickets(response.data);
			} catch (_error) {
				setError("Não foi possível carregar os chamados");
			} finally {
				setIsLoading(false);
			}
		}
		void loadTickets();
	}, []);

	return (
		<section className="mx-auto w-full max-w-260">
			<h1 className="mb-5 text-brand-dark text-xl-bold">Chamados</h1>

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
								Titulo e Servico
							</th>
							<th className="hidden w-[12%] px-3 font-normal md:table-cell">
								Valor total
							</th>
							<th className="hidden w-[14%] px-3 font-normal md:table-cell">
								Cliente
							</th>
							<th className="hidden w-[16%] px-3 font-normal md:table-cell">
								Tecnico
							</th>
							<th className="w-[20%] px-2 font-normal md:w-[15%] md:px-3">
								Status
							</th>
							<th
								className="w-10 px-2 font-normal md:px-3"
								aria-label="Acoes"
							/>
						</tr>
					</thead>
					<tbody className="text-gray-100 text-xs-regular">
						{tickets.map((ticket) => (
							<tr
								key={ticket.id}
								className="border-gray-500 border-b last:border-b-0"
							>
								<td className="px-2 py-3 align-middle text-xxs-bold md:px-3 md:text-xs-regular">
									<span className="block">
										{new Date(ticket.updatedAt).toLocaleDateString("pt-BR")}
									</span>
									<span className="block">
										{new Date(ticket.updatedAt).toLocaleTimeString("pt-BR", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</td>

								<td className="hidden px-3 text-xs-bold md:table-cell">
									{ticket.id.slice(0, 5)}
								</td>

								<td className="px-2 py-3 align-middle md:px-3">
									<strong className="block truncate text-xs-bold">
										{ticket.title}
									</strong>
									<span className="block truncate text-xxs-bold md:text-xs-regular">
										{ticket.ticketServices[0]?.service?.name ??
											"Servico adicional"}
									</span>
								</td>

								<td className="hidden px-3 md:table-cell">
									{ticket.totalPrice.toLocaleString("pt-BR", {
										style: "currency",
										currency: "BRL",
									})}
								</td>

								<td className="hidden px-3 md:table-cell">
									<span className="flex items-center gap-2">
										<Avatar
											name={ticket.client.name}
											src={getUploadUrl(ticket.client.clientProfile?.avatarUrl)}
											size="sm"
										/>
										{ticket.client.name}
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
										{ticket.technician.name}
									</span>
								</td>

								<td className="px-2 py-3 md:px-3">
									<Badge variant="new" className="w-6 px-0 md:w-auto md:px-2">
										<span className="sr-only md:not-sr-only">Aberto</span>
									</Badge>
								</td>

								<td className="px-2 py-3">
									<span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-gray-500 text-gray-300">
										<PencilLineIcon
											className="h-3.5 w-3.5"
											aria-hidden="true"
										/>
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
