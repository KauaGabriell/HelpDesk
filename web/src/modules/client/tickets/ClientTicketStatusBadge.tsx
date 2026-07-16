import { Badge } from "../../../components/ui/Badge/Badge";
import type { ClientTicketStatus } from "./client-ticket.types";

const statusConfig: Record<
	ClientTicketStatus,
	{ label: string; variant: "new" | "info" | "success" }
> = {
	open: { label: "Aberto", variant: "new" },
	in_progress: { label: "Em atendimento", variant: "info" },
	closed: { label: "Encerrado", variant: "success" },
};

export function ClientTicketStatusBadge({
	status,
}: {
	status: ClientTicketStatus;
}) {
	const config = statusConfig[status];
	return <Badge variant={config.variant}>{config.label}</Badge>;
}
