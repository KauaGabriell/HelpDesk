import { PencilLineIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "../../../../components/ui/Avatar/Avatar";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { Pagination } from "../../../../components/ui/Pagination/Pagination";
import { getUploadUrl } from "../../../../lib/upload-url";
import { listAdminClients } from "../client.api";
import type { AdminClient } from "../client.types";
import { getPageAfterDeletion } from "../client.utils";
import { DeleteClientModal } from "../DeleteClientModal";
import { EditClientModal } from "../EditClientModal";

export function AdminClientsPage() {
	const [clients, setClients] = useState<AdminClient[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	const [clientToEdit, setClientToEdit] = useState<AdminClient | null>(null);
	const [clientToDelete, setClientToDelete] = useState<AdminClient | null>(
		null,
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: retryKey intentionally re-runs the request.
	useEffect(() => {
		const controller = new AbortController();

		async function loadClients() {
			try {
				setIsLoading(true);
				setError(null);
				const response = await listAdminClients({
					page,
					signal: controller.signal,
				});
				setClients(response.data);
				setTotalPages(response.pagination.totalPages);
			} catch (requestError) {
				if (
					requestError instanceof DOMException &&
					requestError.name === "AbortError"
				) {
					return;
				}
				setError("Não foi possível carregar os clientes.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}

		void loadClients();
		return () => controller.abort();
	}, [page, retryKey]);

	function reloadCurrentPage() {
		setRetryKey((key) => key + 1);
	}

	function handleEditSuccess() {
		setClientToEdit(null);
		reloadCurrentPage();
	}

	function handleDeleteSuccess() {
		const nextPage = getPageAfterDeletion(page, clients.length);
		setClientToDelete(null);

		if (nextPage !== page) {
			setPage(nextPage);
			return;
		}

		reloadCurrentPage();
	}

	return (
		<section className="mx-auto w-full max-w-267.5">
			<h1 className="mb-5 text-brand-dark text-xl-bold">Clientes</h1>

			{isLoading ? (
				<PageState type="loading" message="Carregando clientes..." />
			) : error ? (
				<PageState type="error" message={error} onRetry={reloadCurrentPage} />
			) : clients.length === 0 ? (
				<PageState type="empty" message="Nenhum cliente encontrado." />
			) : (
				<>
					<div className="overflow-hidden rounded-lg border border-gray-500 bg-gray-600">
						<table className="w-full table-fixed border-collapse text-left">
							<thead className="border-gray-500 border-b">
								<tr className="h-11 text-gray-400 text-xs-regular">
									<th className="w-[43%] px-3 font-normal md:w-[55%]">Nome</th>
									<th className="w-[37%] px-3 font-normal md:w-[35%]">
										E-mail
									</th>
									<th className="w-18 px-2 font-normal" aria-label="Ações" />
								</tr>
							</thead>
							<tbody className="text-gray-100 text-xs-regular">
								{clients.map((client) => (
									<tr
										key={client.id}
										className="h-14 border-gray-500 border-b last:border-b-0"
									>
										<td className="px-3">
											<span className="flex min-w-0 items-center gap-2">
												<Avatar
													name={client.name}
													src={getUploadUrl(client.clientProfile?.avatarUrl)}
													size="sm"
												/>
												<strong className="truncate text-xs-bold">
													{client.name}
												</strong>
											</span>
										</td>
										<td className="truncate px-3">{client.email}</td>
										<td className="px-2">
											<div className="flex items-center justify-end gap-1.5">
												<button
													type="button"
													className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-gray-500 text-danger transition-colors hover:bg-gray-400"
													aria-label={`Excluir ${client.name}`}
													onClick={() => setClientToDelete(client)}
												>
													<Trash2Icon className="h-3.5 w-3.5" />
												</button>
												<button
													type="button"
													className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-gray-500 text-gray-300 transition-colors hover:bg-gray-400 hover:text-gray-100"
													aria-label={`Editar ${client.name}`}
													onClick={() => setClientToEdit(client)}
												>
													<PencilLineIcon className="h-3.5 w-3.5" />
												</button>
											</div>
										</td>
									</tr>
								))}
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

			<EditClientModal
				client={clientToEdit}
				onClose={() => setClientToEdit(null)}
				onSuccess={handleEditSuccess}
			/>
			<DeleteClientModal
				key={clientToDelete?.id ?? "closed"}
				client={clientToDelete}
				onClose={() => setClientToDelete(null)}
				onSuccess={handleDeleteSuccess}
			/>
		</section>
	);
}
