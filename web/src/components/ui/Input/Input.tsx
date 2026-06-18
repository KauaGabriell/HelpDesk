import { CircleAlertIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useId } from "react";

type InputProps = ComponentProps<"input"> & {
	label: string;
	helperText?: string;
	error?: string;
};

export function Input({
	label,
	helperText,
	error,
	id,
	className,
	...props
}: InputProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const helperId = `${inputId}-helper`;
	const feedbackText = error ?? helperText;

	return (
		<div className="group flex w-full flex-col gap-1">
			<label
				htmlFor={inputId}
				className={[
					"text-xxs-bold transition-colors",
					error
						? "text-danger"
						: "text-gray-300 group-focus-within:text-brand-base",
				]
					.filter(Boolean)
					.join(" ")}
			>
				{label}
			</label>

			<input
				id={inputId}
				aria-invalid={Boolean(error)}
				aria-describedby={feedbackText ? helperId : undefined}
				className={[
					"h-8 w-full border-gray-500 border-b bg-transparent text-sm-regular text-gray-100 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-base disabled:cursor-not-allowed disabled:opacity-60",
					error ? "focus:border-gray-500" : undefined,
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			/>

			{feedbackText && (
				<p
					id={helperId}
					className={[
						"flex items-center gap-1 text-xs-regular",
						error ? "text-danger" : "text-gray-400 italic",
					]
						.filter(Boolean)
						.join(" ")}
				>
					{error && <CircleAlertIcon className="h-3 w-3" />}
					{feedbackText}
				</p>
			)}
		</div>
	);
}
