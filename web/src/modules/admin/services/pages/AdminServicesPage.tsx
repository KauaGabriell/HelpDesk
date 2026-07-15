import {
	BanIcon,
	CircleCheckIcon,
	PencilLineIcon,
	PlusIcon,
	RotateCcwIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "../../../../components/ui/Badge/Badge";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { Pagination } from "../../../../components/ui/Pagination/Pagination";
import { HttpError } from "../../../../lib/http-error";
import { ServiceModal } from "../ServiceModal";
import { listAdminServices, updateAdminServiceStatus } from "../service.api";
import type { AdminService } from "../service.types";
import { formatServiceCurrency } from "../service.utils";

export function AdminServicesPage() {
	const [services, setServices] = useState<AdminService[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	const [serviceToEdit, setServiceToEdit] = useState<AdminService | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
	const statusControllerRef = useRef<AbortController | null>(null);

	useEffect(
		() => () => {
			statusControllerRef.current?.abort();
		},
		[],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: retryKey intentionally re-runs request.
	useEffect(() => {
		const controller = new AbortController();

		async function loadServices() {
			try {
				setIsLoading(true);
				setError(null);
				const response = await listAdminServices({
					page,
					signal: controller.signal,
				});
				setServices(response.data);
				setTotalPages(response.pagination.totalPages);
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
	}, [page, retryKey]);

	function reloadCurrentPage() {
		setRetryKey((key) => key + 1);
	}

	async function handleStatusChange(service: AdminService) {
		statusControllerRef.current?.abort();
		const controller = new AbortController();
		statusControllerRef.current = controller;
		setUpdatingStatusId(service.id);
		setError(null);

		try {
			const updatedService = await updateAdminServiceStatus(
				service.id,
				!service.isActive,
				controller.signal,
			);
			setServices((currentServices) =>
				currentServices.map((currentService) =>
					currentService.id === updatedService.id
						? updatedService
						: currentService,
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
					: "Não foi possível atualizar o status do serviço.",
			);
		} finally {
			if (!controller.signal.aborted) setUpdatingStatusId(null);
		}
	}

	function handleModalSuccess() {
		setIsCreateOpen(false);
		setServiceToEdit(null);
		reloadCurrentPage();
	}

	return (
		<section className="mx-auto w-full max-w-267.5">
			<header className="mb-5 flex items-center justify-between gap-4">
				<h1 className="text-brand-dark text-xl-bold">Serviços</h1>
				<button
					type="button"
					className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-sm bg-gray-200 px-0 text-white text-sm-bold transition-colors hover:bg-gray-100 md:w-auto md:px-4"
					aria-label="Novo serviço"
					onClick={() => setIsCreateOpen(true)}
				>
					<PlusIcon className="h-4 w-4" />
					<span className="hidden md:inline">Novo</span>
				</button>
			</header>

			{error && !isLoading ? (
				<div
					className="mb-4 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-danger text-xs-bold"
					role="alert"
				>
					{error}
				</div>
			) : null}

			{isLoading ? (
				<PageState type="loading" message="Carregando serviços..." />
			) : error && services.length === 0 ? (
				<PageState type="error" message={error} onRetry={reloadCurrentPage} />
			) : services.length === 0 ? (
				<PageState type="empty" message="Nenhum serviço encontrado." />
			) : (
				<>
					<div className="overflow-hidden rounded-lg border border-gray-500 bg-gray-600">
						<table className="w-full table-fixed border-collapse text-left">
							<thead className="border-gray-500 border-b">
								<tr className="h-11 text-gray-400 text-xs-regular">
									<th className="w-[38%] px-3 font-normal md:w-[45%]">
										Título
									</th>
									<th className="w-[25%] px-3 font-normal md:w-[18%]">Valor</th>
									<th className="w-[17%] px-2 font-normal md:w-[16%]">
										Status
									</th>
									<th
										className="w-[20%] px-2 font-normal md:w-[21%]"
										aria-label="Ações"
									/>
								</tr>
							</thead>
							<tbody className="text-gray-100 text-xs-regular">
								{services.map((service) => {
									const isUpdatingStatus = updatingStatusId === service.id;
									return (
										<tr
											key={service.id}
											className="h-14 border-gray-500 border-b last:border-b-0"
										>
											<td className="truncate px-3 text-xs-bold">
												{service.name}
											</td>
											<td className="px-3">
												{formatServiceCurrency(service.price)}
											</td>
											<td className="px-2">
												<div className="hidden md:block">
													<Badge
														variant={service.isActive ? "success" : "danger"}
													>
														{service.isActive ? "Ativo" : "Inativo"}
													</Badge>
												</div>
												<div className="flex justify-center md:hidden">
													{service.isActive ? (
														<CircleCheckIcon
															className="h-4 w-4 text-done"
															aria-label="Ativo"
														/>
													) : (
														<BanIcon
															className="h-4 w-4 text-danger"
															aria-label="Inativo"
														/>
													)}
												</div>
											</td>
											<td className="px-2">
												<div className="flex min-w-0 items-center justify-end gap-1.5 whitespace-nowrap">
													<button
														type="button"
														className="hidden h-8 shrink-0 items-center gap-1 rounded-sm px-2 text-gray-300 text-xs-regular hover:bg-gray-500 hover:text-gray-100 disabled:cursor-not-allowed disabled:opacity-60 md:inline-flex"
														disabled={isUpdatingStatus}
														onClick={() => void handleStatusChange(service)}
													>
														{service.isActive ? (
															<BanIcon className="h-4 w-4" />
														) : (
															<RotateCcwIcon className="h-4 w-4" />
														)}
														{service.isActive ? "Desativar" : "Reativar"}
													</button>
													<button
														type="button"
														className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-gray-500 text-gray-300 transition-colors hover:bg-gray-400 hover:text-gray-100 disabled:cursor-not-allowed disabled:opacity-60 md:hidden"
														aria-label={
															service.isActive
																? `Desativar ${service.name}`
																: `Reativar ${service.name}`
														}
														disabled={isUpdatingStatus}
														onClick={() => void handleStatusChange(service)}
													>
														{service.isActive ? (
															<BanIcon className="h-4 w-4" />
														) : (
															<RotateCcwIcon className="h-4 w-4" />
														)}
													</button>
													<button
														type="button"
														className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-gray-500 text-gray-300 transition-colors hover:bg-gray-400 hover:text-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
														aria-label={`Editar ${service.name}`}
														disabled={isUpdatingStatus}
														onClick={() => setServiceToEdit(service)}
													>
														<PencilLineIcon className="h-4 w-4" />
													</button>
												</div>
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

			<ServiceModal
				isOpen={isCreateOpen}
				service={null}
				onClose={() => setIsCreateOpen(false)}
				onSuccess={handleModalSuccess}
			/>
			<ServiceModal
				isOpen={serviceToEdit !== null}
				service={serviceToEdit}
				onClose={() => setServiceToEdit(null)}
				onSuccess={handleModalSuccess}
			/>
		</section>
	);
}
