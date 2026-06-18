import { Decimal } from "@prisma/client/runtime/client";
import { z } from "zod";
import { ServiceCategory } from "../../generated/prisma/enums";

export const createServiceSchema = z.object({
	name: z.string().trim().min(1, "Informe o nome do serviço"),
	price: z.coerce
		.number()
		.positive()
		.transform((val) => new Decimal(val)),
	category: z.enum(ServiceCategory),
});

export const listServicesQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(50).default(10),
	isActive: z
		.enum(["true", "false"])
		.transform((value) => value === "true")
		.optional(),
});

export const updateServiceSchema = z
	.object({
		name: z.string().trim().min(1, "Informe o nome do serviço").optional(),
		price: z.coerce
			.number()
			.positive()
			.transform((val) => new Decimal(val))
			.optional(),
		category: z.enum(ServiceCategory).optional(),
	})
	.refine((service) => Object.keys(service).length > 0, {
		message: "Insira pelo menos um valor para Alterar",
	});

export const updateServiceParamsSchema = z.object({
	serviceId: z.uuid(),
});

export const updateStatusServiceSchema = z.object({
	isActive: z.boolean(),
});

export type createServiceInput = z.infer<typeof createServiceSchema>;
export type listServicesByAdminInput = z.infer<typeof listServicesQuerySchema>;
export type updateServiceInput = z.infer<typeof updateServiceSchema>;
export type updateStatusServiceInput = z.infer<
	typeof updateStatusServiceSchema
>;

export type updateServiceInputWithId = updateServiceInput & {
	serviceId: string;
	changedById: string;
};

export type updateStatusServiceInputWithId = updateStatusServiceInput & {
	serviceId: string;
};
