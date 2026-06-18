import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";

type TagVariant = "default" | "selected" | "readOnly";

type TagProps = ComponentProps<"span"> & {
	variant?: TagVariant;
	onRemove?: () => void;
};

const tagVariants: Record<TagVariant, string> = {
	default: "border-gray-400 bg-transparent text-gray-200 hover:bg-gray-500",
	selected: "border-brand-base bg-brand-base text-white",
	readOnly: "border-gray-500 bg-transparent text-gray-400",
};

export function Tag({
	variant = "default",
	onRemove,
	children,
	className,
	...props
}: TagProps) {
	const isReadOnly = variant === "readOnly";

	return (
		<span
			className={[
				"inline-flex h-7 items-center justify-center gap-1 rounded-full border px-3 text-xs-bold transition-colors",
				tagVariants[variant],
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			{children}
			{onRemove && !isReadOnly && (
				<button
					type="button"
					aria-label="Remover tag"
					className="inline-flex items-center justify-center rounded-full text-current"
					onClick={onRemove}
				>
					<XIcon className="h-3.5 w-3.5" />
				</button>
			)}
		</span>
	);
}
