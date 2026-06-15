import { z } from "zod";

export const createTicketSchema = z.object({
	title: z.string().trim().min(1, "Insira o titulo").max(200),
	description: z.string().trim().optional(),
	serviceIds: z
		.array(z.uuid())
		.min(1, "Insira pelo menos um servico")
		.refine((serviceIds) => new Set(serviceIds).size === serviceIds.length, {
			message: "Nao envie servicos duplicados",
		}),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type CreateTicketServiceInput = CreateTicketInput & {
	clientId: string;
};
