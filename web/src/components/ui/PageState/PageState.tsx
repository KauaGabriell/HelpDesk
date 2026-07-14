import { CircleAlertIcon, InboxIcon, LoaderCircleIcon } from "lucide-react";
import { Button } from "../Button/Button";

type PageStateProps = {
	type: "loading" | "error" | "empty";
	message: string;
	onRetry?: () => void;
};

const stateIcons = {
	loading: LoaderCircleIcon,
	error: CircleAlertIcon,
	empty: InboxIcon,
};

export function PageState({ type, message, onRetry }: PageStateProps) {
	const Icon = stateIcons[type];

	return (
		<div
			className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-gray-500 bg-gray-600 px-5 py-8 text-center"
			role={type === "error" ? "alert" : "status"}
		>
			<Icon
				className={[
					"h-6 w-6",
					type === "loading" ? "animate-spin text-brand-base" : "text-gray-400",
				]
					.filter(Boolean)
					.join(" ")}
				aria-hidden="true"
			/>
			<p className="text-gray-300 text-sm-regular">{message}</p>
			{type === "error" && onRetry ? (
				<Button size="sm" variant="secondary" onClick={onRetry}>
					Tentar novamente
				</Button>
			) : null}
		</div>
	);
}
