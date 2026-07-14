import type { TicketService, TicketStatus } from "./ticket.types";

const serviceCategoryLabels: Record<string, string> = {
	software: "Software",
	hardware: "Hardware",
	network: "Rede",
	support: "Suporte",
	security: "Segurança",
	backup: "Backup",
	others: "Outros",
};

export const ticketStatusConfig = {
	open: { label: "Aberto", badgeVariant: "new" },
	in_progress: { label: "Em atendimento", badgeVariant: "info" },
	closed: { label: "Encerrado", badgeVariant: "success" },
} as const satisfies Record<
	TicketStatus,
	{
		label: string;
		badgeVariant: "new" | "info" | "success";
	}
>;

export function getTicketServiceName(service?: TicketService) {
	return service?.service?.name ?? service?.title ?? "Serviço adicional";
}

export function getBasePrice(services: TicketService[]) {
	return services.reduce(
		(total, ticketService) =>
			ticketService.service ? total + Number(ticketService.price) : total,
		0,
	);
}

export function getAdditionalServices(services: TicketService[]) {
	return services.filter((ticketService) => ticketService.service === null);
}

export function getTicketCategory(services: TicketService[]) {
	const category = services.find((ticketService) => ticketService.service)
		?.service?.serviceCategory;

	return category
		? (serviceCategoryLabels[category] ?? category)
		: "Sem categoria";
}

export function formatCurrency(value: number | string) {
	return Number(value).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function formatDateTime(value: string) {
	const date = new Date(value);

	return {
		date: date.toLocaleDateString("pt-BR"),
		time: date.toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		}),
	};
}
