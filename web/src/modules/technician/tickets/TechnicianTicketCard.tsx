import {
	ClockIcon,
	PencilLineIcon,
	PlayCircleIcon,
	XCircleIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../components/ui/Avatar/Avatar";
import type { TechnicianTicketListItem } from "./technician-ticket.types";
import {
	formatTechnicianCurrency,
	formatTechnicianDateTime,
	getTechnicianTicketServiceName,
} from "./technician-ticket.utils";

type TechnicianTicketCardProps = {
	ticket: TechnicianTicketListItem;
	isUpdating: boolean;
	onStart: (ticket: TechnicianTicketListItem) => void;
	onClose: (ticket: TechnicianTicketListItem) => void;
};

export function TechnicianTicketCard({
	ticket,
	isUpdating,
	onStart,
	onClose,
}: TechnicianTicketCardProps) {
	const primaryService = ticket.ticketServices[0];
	const action =
		ticket.status === "open"
			? { label: "Iniciar", icon: PlayCircleIcon, onClick: onStart }
			: ticket.status === "in_progress"
				? { label: "Encerrar", icon: XCircleIcon, onClick: onClose }
				: null;
	const ActionIcon = action?.icon;

	return (
		<article className="flex min-h-39 flex-col rounded-lg border border-gray-500 bg-gray-600 p-4">
			<header className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<span className="text-gray-400 text-xxs-bold">
						{ticket.id.slice(0, 5)}
					</span>
					<h2 className="mt-1 truncate text-gray-100 text-sm-bold">
						{ticket.title}
					</h2>
					<p className="truncate text-gray-300 text-xs-regular">
						{primaryService
							? getTechnicianTicketServiceName(primaryService)
							: "Sem serviço"}
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<Link
						to={`/technician/tickets/${ticket.id}`}
						className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-gray-500 text-gray-300 transition-colors hover:bg-gray-400 hover:text-gray-100"
						aria-label={`Ver chamado ${ticket.title}`}
					>
						<PencilLineIcon className="h-4 w-4" />
					</Link>
					{action && ActionIcon ? (
						<button
							type="button"
							className="inline-flex h-8 items-center gap-1 rounded-sm bg-gray-200 px-2 text-white text-xs-bold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
							disabled={isUpdating}
							onClick={() => action.onClick(ticket)}
						>
							<ActionIcon className="h-3.5 w-3.5" />
							{action.label}
						</button>
					) : null}
				</div>
			</header>

			<div className="mt-5 flex items-center justify-between border-gray-500 border-t pt-3 text-gray-300 text-xs-regular">
				<span>{formatTechnicianDateTime(ticket.createdAt)}</span>
				<strong className="text-xs-bold">
					{formatTechnicianCurrency(ticket.totalPrice)}
				</strong>
			</div>
			<footer className="mt-auto flex items-center justify-between pt-4">
				<div className="flex items-center gap-2 text-gray-100 text-xs-regular">
					<Avatar name="Cliente" size="sm" />
					<span>Cliente</span>
				</div>
				<ClockIcon className="h-4 w-4 text-progress" aria-hidden="true" />
			</footer>
		</article>
	);
}
