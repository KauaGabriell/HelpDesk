import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../modules/auth/auth.store";
import type { UserRole } from "../../modules/auth/auth.types";

type RoleRouteProps = {
	allowedRoles: UserRole[];
};

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
	const { isAuthenticated, isLoading, user } = useAuth();

	if (isLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	if (!allowedRoles.includes(user.role)) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
