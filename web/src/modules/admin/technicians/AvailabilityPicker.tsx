import { Tag } from "../../../components/ui/Tag/Tag";
import { availabilityGroups, sortAvailability } from "./technician.utils";

type AvailabilityPickerProps = {
	value: string[];
	onChange: (availability: string[]) => void;
};

export function AvailabilityPicker({
	value,
	onChange,
}: AvailabilityPickerProps) {
	function toggleHour(hour: string) {
		onChange(
			value.includes(hour)
				? value.filter((selectedHour) => selectedHour !== hour)
				: sortAvailability([...value, hour]),
		);
	}

	return (
		<div className="flex flex-col gap-5">
			{availabilityGroups.map((group) => (
				<fieldset key={group.label}>
					<legend className="mb-2 text-gray-300 text-xxs-bold">
						{group.label}
					</legend>
					<div className="flex flex-wrap gap-2">
						{group.hours.map((hour) => {
							const isSelected = value.includes(hour);

							return isSelected ? (
								<Tag
									key={hour}
									variant="selected"
									onRemove={() => toggleHour(hour)}
								>
									{hour}
								</Tag>
							) : (
								<button
									key={hour}
									type="button"
									onClick={() => toggleHour(hour)}
									aria-label={`Selecionar ${hour}`}
								>
									<Tag>{hour}</Tag>
								</button>
							);
						})}
					</div>
				</fieldset>
			))}
		</div>
	);
}
