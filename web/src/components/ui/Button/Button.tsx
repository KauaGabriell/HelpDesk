import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "link";
type ButtonSize = "md" | "sm";

type ButtonBaseProps = Omit<ComponentProps<"button">, "children"> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	icon?: ReactNode;
};

type ButtonProps =
	| (ButtonBaseProps & {
			iconOnly: true;
			"aria-label": string;
			children?: never;
	  })
	| (ButtonBaseProps & {
			iconOnly?: false;
			children?: ReactNode;
	  });

const buttonVariants: Record<ButtonVariant, string> = {
	primary: "bg-gray-200 text-white hover:bg-gray-100",
	secondary: "bg-gray-500 text-gray-200 hover:bg-gray-400 hover:text-gray-100",
	link: "bg-transparent text-gray-300 hover:bg-gray-500 hover:text-gray-100",
};

const buttonSizes: Record<ButtonSize, string> = {
	md: "h-10 gap-2 px-4 text-sm-bold",
	sm: "h-8 gap-2 px-3 text-xs-bold",
};

const iconOnlySizes: Record<ButtonSize, string> = {
	md: "h-10 w-10 p-0",
	sm: "h-8 w-8 p-0",
};

export function Button({
	variant = "primary",
	size = "md",
	icon,
	iconOnly = false,
	children,
	className,
	type = "button",
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={[
				"inline-flex items-center justify-center rounded-sm transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:h-4 [&_svg]:w-4",
				buttonVariants[variant],
				iconOnly ? iconOnlySizes[size] : buttonSizes[size],
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			{icon}
			{!iconOnly && children}
		</button>
	);
}
