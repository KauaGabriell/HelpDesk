export type Pagination = {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	perPage: number;
};

export type PaginatedResponse<T> = {
	data: T[];
	pagination: Pagination;
};
