import {
	BriefcaseBusinessIcon,
	ClipboardListIcon,
	UsersRoundIcon,
	WrenchIcon,
} from "lucide-react";

export function AdminNavigation() {
	return (
		<ul className="flex flex-col gap-1" aria-label="Menu administrativo">
			<li>
				<span className="flex h-10 items-center gap-3 rounded-sm bg-brand-dark px-3 text-white text-xs-regular">
					<ClipboardListIcon className="h-4 w-4" aria-hidden="true" />
					Chamados
				</span>
			</li>
			<li>
				<span className="flex h-10 items-center gap-3 px-3 text-gray-400 text-xs-regular">
					<UsersRoundIcon className="h-4 w-4" aria-hidden="true" />
					Tecnicos
				</span>
			</li>
			<li>
				<span className="flex h-10 items-center gap-3 px-3 text-gray-400 text-xs-regular">
					<BriefcaseBusinessIcon className="h-4 w-4" aria-hidden="true" />
					Clientes
				</span>
			</li>
			<li>
				<span className="flex h-10 items-center gap-3 px-3 text-gray-400 text-xs-regular">
					<WrenchIcon className="h-4 w-4" aria-hidden="true" />
					Servicos
				</span>
			</li>
		</ul>
	);
}
