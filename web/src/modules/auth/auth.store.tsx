import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import {
	getAuthToken,
	removeAuthToken,
	saveAuthToken,
} from "../../lib/storage";

type AuthContextValue = {
	token: string | null;
	isAuthenticated: boolean;
	setToken: (token: string) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
	children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
	const [token, setTokenState] = useState(() => getAuthToken());

	const setToken = useCallback((newToken: string) => {
		saveAuthToken(newToken);
		setTokenState(newToken);
	}, []);

	const logout = useCallback(() => {
		removeAuthToken();
		setTokenState(null);
	}, []);

	const value = useMemo(
		() => ({
			token,
			isAuthenticated: Boolean(token),
			setToken,
			logout,
		}),
		[token, setToken, logout],
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
