import type { ClientTicketService } from "./client-ticket.types";

const serviceCategoryLabels: Record<string, string> = {
	software: "Software",
	hardware: "Hardware",
	network: "Rede",
	support: "Suporte",
	security: "Segurança",
	backup: "Backup",
	others: "Outros",
};

export function getClientTicketServiceName(service: ClientTicketService) {
	return service.service?.name ?? service.title ?? "Serviço adicional";
}

export function formatClientServiceCategory(category?: string) {
	return category
		? (serviceCategoryLabels[category] ?? category)
		: "Sem categoria";
}
