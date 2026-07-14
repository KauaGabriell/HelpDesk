export function getPageAfterDeletion(currentPage: number, itemCount: number) {
	return itemCount === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
}
