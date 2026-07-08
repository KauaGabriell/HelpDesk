import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	getAuthToken,
	removeAuthToken,
	saveAuthToken,
} from "../../lib/storage";
import { getMe } from "./auth.api";
import type { AuthUser } from "./auth.types";

type AuthContextValue = {
	token: string | null;
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setAuth: (data: { token: string; user: AuthUser }) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
	children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
	const [token, setTokenState] = useState(() => getAuthToken());
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(() => Boolean(getAuthToken()));

	const setAuth = useCallback((data: { token: string; user: AuthUser }) => {
		saveAuthToken(data.token);
		setTokenState(data.token);
		setUser(data.user);
		setIsLoading(false);
	}, []);

	const logout = useCallback(() => {
		removeAuthToken();
		setTokenState(null);
		setUser(null);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		if (!token) {
			setIsLoading(false);
			return;
		}

		let ignore = false;

		async function loadAuthenticatedUser() {
			try {
				const authenticatedUser = await getMe();

				if (!ignore) {
					setUser(authenticatedUser);
				}
			} catch {
				if (!ignore) {
					removeAuthToken();
					setTokenState(null);
					setUser(null);
				}
			} finally {
				if (!ignore) {
					setIsLoading(false);
				}
			}
		}

		loadAuthenticatedUser();

		return () => {
			ignore = true;
		};
	}, [token]);

	const value = useMemo(
		() => ({
			token,
			user,
			isAuthenticated: Boolean(token),
			isLoading,
			setAuth,
			logout,
		}),
		[token, user, isLoading, setAuth, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}

	return context;
}
