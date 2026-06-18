import { CheckCircleIcon, CircleAlertIcon, ClockIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type BadgeVariant = "new" | "info" | "success" | "danger";

type BadgeProps = ComponentProps<"div"> & {
	variant?: BadgeVariant;
	icon?: ReactNode;
};

const badgeVariants: Record<BadgeVariant, string> = {
	new: "bg-open/10 text-open",
	info: "bg-progress/10 text-progress",
	success: "bg-done/10 text-done",
	danger: "bg-danger/10 text-danger",
};

const badgeIcons: Record<BadgeVariant, ReactNode> = {
	new: <CircleAlertIcon />,
	info: <ClockIcon />,
	success: <CheckCircleIcon />,
	danger: <CircleAlertIcon />,
};

export function Badge({
	variant = "new",
	icon,
	children,
	className,
	...props
}: BadgeProps) {
	return (
		<div
			className={[
				"inline-flex h-6 items-center justify-center gap-1 rounded-full px-2 text-xs-bold [&_svg]:h-3.5 [&_svg]:w-3.5",
				badgeVariants[variant],
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			{icon ?? badgeIcons[variant]}
			{children}
		</div>
	);
}
