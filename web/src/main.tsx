import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./Global.css";
import { App } from "./app/App";
import { AuthProvider } from "./modules/auth/auth.store";

// biome-ignore lint/style/noNonNullAssertion: <>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</StrictMode>,
);
