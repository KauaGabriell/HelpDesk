import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../Button/Button";

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	disabled?: boolean;
};

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	disabled = false,
}: PaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<nav
			className="mt-4 flex items-center justify-end gap-3"
			aria-label="Paginação"
		>
			<Button
				variant="secondary"
				size="sm"
				iconOnly
				icon={<ChevronLeftIcon />}
				aria-label="Página anterior"
				disabled={disabled || currentPage <= 1}
				onClick={() => onPageChange(currentPage - 1)}
			/>

			<span className="min-w-20 text-center text-gray-300 text-xs-regular">
				Página {currentPage} de {totalPages}
			</span>

			<Button
				variant="secondary"
				size="sm"
				iconOnly
				icon={<ChevronRightIcon />}
				aria-label="Próxima página"
				disabled={disabled || currentPage >= totalPages}
				onClick={() => onPageChange(currentPage + 1)}
			/>
		</nav>
	);
}
