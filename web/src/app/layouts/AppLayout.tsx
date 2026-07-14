import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import helpdeskLogo from "../../assets/Logo_IconDark.png";
import { RoleNavigation } from "../../components/navigation/RoleNavigation";
import { Avatar } from "../../components/ui/Avatar/Avatar";
import { useAuth } from "../../modules/auth/auth.store";

const roleLabels = {
	admin: "ADMIN",
	client: "CLIENTE",
	technician: "TÉCNICO",
} as const;

export function AppLayout() {
	const { user } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const roleLabel = user ? roleLabels[user.role] : "";
	const userName = user?.name ?? "Usuário Admin";
	const userEmail = user?.email ?? "user.adm@test.com";

	return (
		<div className="min-h-screen bg-gray-100 md:flex md:items-start md:pt-3">
			<header className="relative z-40 flex h-18 items-center justify-between bg-gray-100 px-5 md:hidden">
				<div className="flex items-center gap-3">
					<button
						type="button"
						className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
						aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
						aria-expanded={isMobileMenuOpen}
						onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
					>
						{isMobileMenuOpen ? (
							<XIcon className="h-5 w-5" />
						) : (
							<MenuIcon className="h-5 w-5" />
						)}
					</button>

					<div className="flex items-center gap-2">
						<img
							src={helpdeskLogo}
							alt=""
							className="h-9 w-9"
							aria-hidden="true"
						/>
						<div className="flex flex-col justify-center">
							<strong className="text-gray-600 text-sm-bold">HelpDesk</strong>
							{roleLabel && (
								<span className="text-brand-light text-xxs-bold">
									{roleLabel}
								</span>
							)}
						</div>
					</div>
				</div>

				<Avatar name={userName} size="md" />
			</header>

			{isMobileMenuOpen && user ? (
				<div className="fixed inset-0 top-18 z-30 bg-gray-100/50 md:hidden">
					<nav
						className="w-full bg-gray-100 px-4 py-4 shadow-lg"
						aria-label="Menu"
					>
						<RoleNavigation
							role={user.role}
							onNavigate={() => setIsMobileMenuOpen(false)}
						/>
					</nav>
				</div>
			) : null}

			<aside className="hidden h-[calc(100vh-12px)] w-50 shrink-0 flex-col bg-gray-100 md:flex">
				<div className="flex h-23 items-center gap-3 border-gray-200 border-b px-5">
					<img
						src={helpdeskLogo}
						alt=""
						className="h-11 w-11"
						aria-hidden="true"
					/>

					<div className="flex flex-col justify-center">
						<strong className="text-gray-600 text-lg-bold">HelpDesk</strong>
						{roleLabel && (
							<span className="text-brand-light text-xxs-bold">
								{roleLabel}
							</span>
						)}
					</div>
				</div>

				<nav className="flex flex-1 flex-col gap-1 px-4 py-5" aria-label="Menu">
					{user && <RoleNavigation role={user.role} />}
				</nav>

				<div className="flex h-28 items-center gap-3 border-gray-200 border-t px-5">
					<Avatar name={userName} size="md" />
					<div className="min-w-0">
						<p className="truncate text-gray-600 text-xs-regular">{userName}</p>
						<p className="truncate text-gray-400 text-xxs-bold">{userEmail}</p>
					</div>
				</div>
			</aside>

			<main className="min-h-[calc(100vh-72px)] rounded-t-2xl bg-gray-600 px-5 py-6 md:min-h-[calc(100vh-12px)] md:flex-1 md:rounded-tl-[20px] md:rounded-tr-none md:px-12 md:py-13">
				<Outlet />
			</main>
		</div>
	);
}
