import type {
	CreateAdminServiceInput,
	ServiceCategory,
	ServiceFormValues,
} from "./service.types";

const serviceCategoryLabels: Record<ServiceCategory, string> = {
	software: "Software",
	hardware: "Hardware",
	network: "Rede",
	support: "Suporte",
	security: "Segurança",
	backup: "Backup",
	others: "Outros",
};

export function formatServiceCurrency(value: number | string) {
	return Number(value).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function formatServiceCategory(category: ServiceCategory) {
	return serviceCategoryLabels[category];
}

export function toServicePayload(
	values: ServiceFormValues,
): CreateAdminServiceInput {
	return {
		name: values.name.trim(),
		price: Number(values.price),
		category: values.serviceCategory,
	};
}
