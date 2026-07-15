import { Badge } from "../../../components/ui/Badge/Badge";
import type { TechnicianTicketStatus } from "./technician-ticket.types";
import { technicianTicketStatusConfig } from "./technician-ticket.utils";

type TechnicianTicketStatusBadgeProps = {
	status: TechnicianTicketStatus;
};

export function TechnicianTicketStatusBadge({
	status,
}: TechnicianTicketStatusBadgeProps) {
	const config = technicianTicketStatusConfig[status];
	return <Badge variant={config.badgeVariant}>{config.label}</Badge>;
}
