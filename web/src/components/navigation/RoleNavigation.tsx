import type { LucideIcon } from "lucide-react";
import {
	BriefcaseBusinessIcon,
	ClipboardListIcon,
	PlusIcon,
	UsersRoundIcon,
	WrenchIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import type { UserRole } from "../../modules/auth/auth.types";

type NavigationItem = {
	label: string;
	icon: LucideIcon;
	to?: string;
};

const navigationByRole: Record<UserRole, NavigationItem[]> = {
	admin: [
		{ label: "Chamados", icon: ClipboardListIcon, to: "/admin/tickets" },
		{ label: "Técnicos", icon: UsersRoundIcon, to: "/admin/technicians" },
		{ label: "Clientes", icon: BriefcaseBusinessIcon, to: "/admin/clients" },
		{ label: "Serviços", icon: WrenchIcon, to: "/admin/services" },
	],
	technician: [
		{
			label: "Meus chamados",
			icon: ClipboardListIcon,
			to: "/technician/tickets",
		},
	],
	client: [
		{ label: "Meus chamados", icon: ClipboardListIcon, to: "/client/tickets" },
		{ label: "Criar chamado", icon: PlusIcon, to: "/client/tickets/new" },
	],
};

type RoleNavigationProps = {
	role: UserRole;
	onNavigate?: () => void;
};

const navigationItemClassName =
	"flex h-11 items-center gap-3 rounded-sm px-3 text-sm-regular transition-colors";

export function RoleNavigation({ role, onNavigate }: RoleNavigationProps) {
	return (
		<ul className="flex flex-col gap-1" aria-label="Menu principal">
			{navigationByRole[role].map(({ label, icon: Icon, to }) => (
				<li key={label}>
					{to ? (
						<NavLink
							to={to}
							onClick={onNavigate}
							className={({ isActive }) =>
								`${navigationItemClassName} ${
									isActive
										? "bg-brand-dark text-white"
										: "text-gray-400 hover:bg-gray-200 hover:text-gray-600"
								}`
							}
						>
							<Icon className="h-5 w-5" aria-hidden="true" />
							{label}
						</NavLink>
					) : (
						<span
							className={`${navigationItemClassName} cursor-not-allowed text-gray-400 opacity-60`}
							aria-disabled="true"
						>
							<Icon className="h-5 w-5" aria-hidden="true" />
							{label}
						</span>
					)}
				</li>
			))}
		</ul>
	);
}
