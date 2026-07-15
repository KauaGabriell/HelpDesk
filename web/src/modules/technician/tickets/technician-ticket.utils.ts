import type {
	ExtraServiceFormValues,
	ExtraServiceInput,
	TechnicianTicketService,
	TechnicianTicketStatus,
} from "./technician-ticket.types";

export const technicianTicketStatusConfig = {
	open: { label: "Aberto", badgeVariant: "new" },
	in_progress: { label: "Em atendimento", badgeVariant: "info" },
	closed: { label: "Encerrado", badgeVariant: "success" },
} as const satisfies Record<
	TechnicianTicketStatus,
	{ label: string; badgeVariant: "new" | "info" | "success" }
>;

export function groupTechnicianTicketsByStatus<
	Ticket extends { status: TechnicianTicketStatus },
>(tickets: Ticket[]) {
	return tickets.reduce<Record<TechnicianTicketStatus, Ticket[]>>(
		(groups, ticket) => {
			groups[ticket.status].push(ticket);
			return groups;
		},
		{ open: [], in_progress: [], closed: [] },
	);
}

export function getTechnicianTicketServiceName(
	service: TechnicianTicketService,
) {
	return service.service?.name ?? service.title ?? "Serviço adicional";
}

export function formatTechnicianCurrency(value: number | string) {
	return Number(value).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function formatTechnicianDateTime(value: string) {
	const date = new Date(value);
	return date.toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function toExtraServicePayload(
	values: ExtraServiceFormValues,
): ExtraServiceInput {
	const description = values.description.trim();
	return {
		title: values.title.trim(),
		...(description ? { description } : {}),
		price: Number(values.price),
	};
}
