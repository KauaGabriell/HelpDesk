export const availabilityGroups = [
	{
		label: "Manhã",
		hours: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00"],
	},
	{
		label: "Tarde",
		hours: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
	},
	{
		label: "Noite",
		hours: ["19:00", "20:00", "21:00", "22:00", "23:00"],
	},
] as const;

export function sortAvailability(availability: string[]) {
	return availability.toSorted((first, second) => first.localeCompare(second));
}

export function getAvailabilitySummary(
	availability: string[],
	visibleLimit: number,
) {
	const sortedAvailability = sortAvailability(availability);

	return {
		visible: sortedAvailability.slice(0, visibleLimit),
		remaining: Math.max(sortedAvailability.length - visibleLimit, 0),
	};
}
