import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/guards/ProtectedRoute";
import { RoleRoute } from "../components/guards/RoleRoute";
import { AdminClientsPage } from "../modules/admin/clients/pages/AdminClientsPage";
import { AdminTechnicianFormPage } from "../modules/admin/technicians/pages/AdminTechnicianFormPage";
import { AdminTechniciansPage } from "../modules/admin/technicians/pages/AdminTechniciansPage";
import { AdminTicketDetailsPage } from "../modules/admin/tickets/pages/AdminTicketDetailsPage";
import { AdminTicketsPage } from "../modules/admin/tickets/pages/AdminTicketsPage";
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
							<Route path="/admin/clients" element={<AdminClientsPage />} />
							<Route path="/admin/tickets" element={<AdminTicketsPage />} />
							<Route
								path="/admin/tickets/:ticketId"
								element={<AdminTicketDetailsPage />}
							/>
							<Route
								path="/admin/technicians"
								element={<AdminTechniciansPage />}
							/>
							<Route
								path="/admin/technicians/new"
								element={<AdminTechnicianFormPage mode="create" />}
							/>
							<Route
								path="/admin/technicians/:technicianId/edit"
								element={<AdminTechnicianFormPage mode="edit" />}
							/>
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
