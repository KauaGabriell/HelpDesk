import { PencilLineIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../../components/ui/Avatar/Avatar";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { Pagination } from "../../../../components/ui/Pagination/Pagination";
import { Tag } from "../../../../components/ui/Tag/Tag";
import { getUploadUrl } from "../../../../lib/upload-url";
import { listAdminTechnicians } from "../technician.api";
import type { AdminTechnician } from "../technician.types";
import { getAvailabilitySummary } from "../technician.utils";

type AvailabilitySummaryProps = {
	availability: string[];
	limit: number;
};

function AvailabilitySummary({
	availability,
	limit,
}: AvailabilitySummaryProps) {
	if (availability.length === 0) {
		return (
			<span className="text-gray-400 text-xs-regular">Sem disponibilidade</span>
		);
	}

	const summary = getAvailabilitySummary(availability, limit);

	return (
		<div className="flex min-w-0 items-center gap-1.5">
			{summary.visible.map((hour) => (
				<Tag key={hour} variant="readOnly" className="h-6 px-2">
					{hour}
				</Tag>
			))}
			{summary.remaining > 0 ? (
				<Tag variant="readOnly" className="h-6 px-2">
					+{summary.remaining}
				</Tag>
			) : null}
		</div>
	);
}

export function AdminTechniciansPage() {
	const [technicians, setTechnicians] = useState<AdminTechnician[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: retryKey intentionally re-runs the request.
	useEffect(() => {
		const controller = new AbortController();

		async function loadTechnicians() {
			try {
				setIsLoading(true);
				setError(null);
				const response = await listAdminTechnicians({
					page,
					signal: controller.signal,
				});
				setTechnicians(response.data);
				setTotalPages(response.pagination.totalPages);
			} catch (requestError) {
				if (
					requestError instanceof DOMException &&
					requestError.name === "AbortError"
				) {
					return;
				}
				setError("Não foi possível carregar os técnicos.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}

		void loadTechnicians();
		return () => controller.abort();
	}, [page, retryKey]);

	return (
		<section className="mx-auto w-full max-w-267.5">
			<header className="mb-5 flex items-center justify-between gap-4">
				<h1 className="text-brand-dark text-xl-bold">Técnicos</h1>
				<Link
					to="/admin/technicians/new"
					className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-sm bg-gray-200 px-0 text-white text-sm-bold transition-colors hover:bg-gray-100 md:w-auto md:px-4"
					aria-label="Novo técnico"
				>
					<PlusIcon className="h-4 w-4" />
					<span className="hidden md:inline">Novo</span>
				</Link>
			</header>

			{isLoading ? (
				<PageState type="loading" message="Carregando técnicos..." />
			) : error ? (
				<PageState
					type="error"
					message={error}
					onRetry={() => setRetryKey((key) => key + 1)}
				/>
			) : technicians.length === 0 ? (
				<PageState type="empty" message="Nenhum técnico encontrado." />
			) : (
				<>
					<div className="overflow-hidden rounded-lg border border-gray-500 bg-gray-600">
						<table className="w-full table-fixed border-collapse text-left">
							<thead className="border-gray-500 border-b">
								<tr className="h-11 text-gray-400 text-xs-regular">
									<th className="w-[45%] px-3 font-normal md:w-[38%]">Nome</th>
									<th className="hidden w-[28%] px-3 font-normal md:table-cell">
										E-mail
									</th>
									<th className="w-[43%] px-3 font-normal md:w-[29%]">
										Disponibilidade
									</th>
									<th className="w-10 px-2 font-normal" aria-label="Ações" />
								</tr>
							</thead>
							<tbody className="text-gray-100 text-xs-regular">
								{technicians.map((technician) => (
									<tr
										key={technician.id}
										className="h-14 border-gray-500 border-b last:border-b-0"
									>
										<td className="px-3">
											<span className="flex min-w-0 items-center gap-2">
												<Avatar
													name={technician.name}
													src={getUploadUrl(
														technician.technicianProfile?.avatarUrl,
													)}
													size="sm"
												/>
												<strong className="truncate text-xs-bold">
													{technician.name}
												</strong>
											</span>
										</td>
										<td className="hidden truncate px-3 md:table-cell">
											{technician.email}
										</td>
										<td className="px-3">
											<div className="md:hidden">
												<AvailabilitySummary
													availability={
														technician.technicianProfile?.availability ?? []
													}
													limit={1}
												/>
											</div>
											<div className="hidden md:block">
												<AvailabilitySummary
													availability={
														technician.technicianProfile?.availability ?? []
													}
													limit={4}
												/>
											</div>
										</td>
										<td className="px-2">
											<Link
												to={`/admin/technicians/${technician.id}/edit`}
												className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-gray-500 text-gray-300 transition-colors hover:bg-gray-400 hover:text-gray-100"
												aria-label={`Editar ${technician.name}`}
											>
												<PencilLineIcon className="h-3.5 w-3.5" />
											</Link>
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
		</section>
	);
}
