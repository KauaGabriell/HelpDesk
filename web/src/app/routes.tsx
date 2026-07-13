import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/guards/ProtectedRoute";
import { RoleRoute } from "../components/guards/RoleRoute";
import { AdminTicketsPage } from "../modules/admin/pages/AdminTicketsPage";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { ClientTicketsPage } from "../modules/client/pages/ClientTicketsPage";
import { NotFoundPage } from "../modules/not-found/pages/NotFoundPage";
import { TechnicianTicketsPage } from "../modules/technician/pages/TechnicianTicketsPage";
import { AppLayout } from "./layouts/AppLayout";

export function AppRoutes() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/" element={<Navigate to="/login" replace />} />

				<Route element={<ProtectedRoute />}>
					<Route element={<AppLayout />}>
						<Route element={<RoleRoute allowedRoles={["admin"]} />}>
							<Route path="/admin/tickets" element={<AdminTicketsPage />} />
						</Route>

						<Route element={<RoleRoute allowedRoles={["technician"]} />}>
							<Route
								path="/technician/tickets"
								element={<TechnicianTicketsPage />}
							/>
						</Route>
						<Route element={<RoleRoute allowedRoles={["client"]} />}>
							<Route path="/client/tickets" element={<ClientTicketsPage />} />
						</Route>
					</Route>
				</Route>

				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</BrowserRouter>
	);
}
