export type CreateClientTicketFormValues = {
	title: string;
	description: string;
	serviceId: string;
};

export function toCreateClientTicketPayload(
	values: CreateClientTicketFormValues,
) {
	const description = values.description.trim();

	return {
		title: values.title.trim(),
		...(description ? { description } : {}),
		serviceIds: [values.serviceId],
	};
}

export function formatClientCurrency(value: string | number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(Number(value));
}

export function formatClientDateTime(value: string) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(new Date(value));
}
