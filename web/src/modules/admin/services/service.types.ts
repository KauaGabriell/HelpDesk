import type { PaginatedResponse } from "../../../types/pagination";

export const serviceCategories = [
	"software",
	"hardware",
	"network",
	"support",
	"security",
	"backup",
	"others",
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

export type AdminService = {
	id: string;
	name: string;
	price: string | number;
	serviceCategory: ServiceCategory;
	isActive: boolean;
};

export type PaginatedAdminServices = PaginatedResponse<AdminService>;

export type ServiceFormValues = {
	name: string;
	price: string;
	serviceCategory: ServiceCategory;
};

export type CreateAdminServiceInput = {
	name: string;
	price: number;
	category: ServiceCategory;
};

export type UpdateAdminServiceInput = CreateAdminServiceInput;
