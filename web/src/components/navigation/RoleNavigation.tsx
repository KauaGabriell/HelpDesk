import type { LucideIcon } from "lucide-react";
import {
	BriefcaseBusinessIcon,
	ClipboardListIcon,
	PlusIcon,
	UsersRoundIcon,
	WrenchIcon,
} from "lucide-react";
import type { UserRole } from "../../modules/auth/auth.types";

type NavigationItem = {
	label: string;
	icon: LucideIcon;
	isActive?: boolean;
};

const navigationByRole: Record<UserRole, NavigationItem[]> = {
	admin: [
		{ label: "Chamados", icon: ClipboardListIcon, isActive: true },
		{ label: "Tecnicos", icon: UsersRoundIcon },
		{ label: "Clientes", icon: BriefcaseBusinessIcon },
		{ label: "Servicos", icon: WrenchIcon },
	],
	technician: [
		{ label: "Meus chamados", icon: ClipboardListIcon, isActive: true },
	],
	client: [
		{ label: "Meus chamados", icon: ClipboardListIcon, isActive: true },
		{ label: "Criar chamado", icon: PlusIcon },
	],
};

type RoleNavigationProps = {
	role: UserRole;
};

export function RoleNavigation({ role }: RoleNavigationProps) {
	return (
		<ul className="flex flex-col gap-1" aria-label="Menu principal">
			{navigationByRole[role].map(({ label, icon: Icon, isActive }) => (
				<li key={label}>
					<span
						className={[
							"flex h-11 items-center gap-3 rounded-sm px-3 text-sm-regular",
							isActive ? "bg-brand-dark text-white" : "text-gray-400",
						]
							.filter(Boolean)
							.join(" ")}
					>
						<Icon className="h-5 w-5" aria-hidden="true" />
						{label}
					</span>
				</li>
			))}
		</ul>
	);
}
