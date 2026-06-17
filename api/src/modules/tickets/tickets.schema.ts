import { Decimal } from "@prisma/client/runtime/client";
import { z } from "zod";
import { TicketStatus } from "../../generated/prisma/enums";

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

export const ticketIdParamsSchema = z.object({
	ticketId: z.uuid(),
});

export const changeTicketStatusSchema = z.object({
	status: z.enum(TicketStatus),
});

export const extraServiceSchema = z.object({
	title: z.string().trim().min(1, "Insira um nome"),
	description: z.string().optional(),
	price: z
		.number()
		.positive()
		.transform((val) => new Decimal(val)),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ChangeTicketStatusInput = z.infer<typeof changeTicketStatusSchema>;
export type AddExtraServiceInput = z.infer<typeof extraServiceSchema>;

export type AddExtraServiceService = AddExtraServiceInput & {
	technicianId: string;
	ticketId: string;
};

export type TechnicianTicketActionServiceInput = {
	technicianId: string;
	ticketId: string;
};

export type ChangeTicketStatusByAdminServiceInput = ChangeTicketStatusInput & {
	ticketId: string;
};

export type CreateTicketServiceInput = CreateTicketInput & {
	clientId: string;
};
