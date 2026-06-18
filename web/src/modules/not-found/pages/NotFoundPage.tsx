import "./NotFoundPage.css";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
	const navigate = useNavigate();
	return (
		<main className="not-found-page">
			<section className="not-found-card" aria-labelledby="not-found-title">
				<span className="not-found-code">404</span>

				<div className="not-found-content">
					<h1 id="not-found-title">Pagina nao encontrada</h1>
				</div>

				<button
					className="not-found-button"
					type="button"
					onClick={() => navigate("/login")}
				>
					Voltar para login
				</button>
			</section>
		</main>
	);
}
