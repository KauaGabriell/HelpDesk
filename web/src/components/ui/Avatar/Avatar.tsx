import type { ComponentProps } from "react";

type AvatarSize = "sm" | "md";

type AvatarProps = ComponentProps<"div"> & {
	name?: string | null;
	src?: string | null;
	size?: AvatarSize;
};

const avatarSizes: Record<AvatarSize, string> = {
	sm: "h-6 w-6 text-xxs-bold",
	md: "h-8 w-8 text-xs-bold",
};

function getInitials(name?: string | null) {
	if (!name) return "?";

	const words = name.trim().split(/\s+/).filter(Boolean);

	if (words.length === 0) {
		return "?";
	}

	const firstInitial = words[0]?.[0] ?? "";
	const lastInitial = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";

	return `${firstInitial}${lastInitial}`.toUpperCase();
}

export function Avatar({
	name,
	src,
	size = "md",
	className,
	...props
}: AvatarProps) {
	const initials = getInitials(name);

	return (
		<div
			className={[
				"inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-dark text-white",
				avatarSizes[size],
				className,
			]
				.filter(Boolean)
				.join(" ")}
			title={name ?? "Avatar"}
			{...props}
		>
			{src ? (
				<img
					src={src}
					alt={name ?? "Avatar"}
					className="h-full w-full object-cover"
				/>
			) : (
				initials
			)}
		</div>
	);
}
