import { Badge } from "../../../components/ui/Badge/Badge";
import type { TicketStatus } from "./ticket.types";
import { ticketStatusConfig } from "./ticket.utils";

type TicketStatusBadgeProps = {
	status: TicketStatus;
	compact?: boolean;
};

export function TicketStatusBadge({
	status,
	compact = false,
}: TicketStatusBadgeProps) {
	const config = ticketStatusConfig[status];

	return (
		<Badge
			variant={config.badgeVariant}
			className={compact ? "w-6 px-0 md:w-auto md:px-2" : undefined}
		>
			<span className={compact ? "sr-only md:not-sr-only" : undefined}>
				{config.label}
			</span>
		</Badge>
	);
}
