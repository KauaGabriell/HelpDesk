import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../modules/auth/auth.store";

export function TechnicianPasswordGuard() {
	const { user } = useAuth();

	if (user?.role === "technician" && user.mustChangePassword) {
		return <Navigate to="/technician/change-password" replace />;
	}

	return <Outlet />;
}
