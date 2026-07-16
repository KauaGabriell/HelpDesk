import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button/Button";
import { Modal } from "../../../components/ui/Modal/Modal";
import { HttpError } from "../../../lib/http-error";
import { useAuth } from "../../auth/auth.store";
import { deleteOwnClientProfile } from "./client-profile.api";

type DeleteClientAccountModalProps = {
	isOpen: boolean;
	name: string;
	onClose: () => void;
};

export function DeleteClientAccountModal({
	isOpen,
	name,
	onClose,
}: DeleteClientAccountModalProps) {
	const { logout } = useAuth();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const controllerRef = useRef<AbortController | null>(null);

	async function handleDelete() {
		controllerRef.current?.abort();
		const controller = new AbortController();
		controllerRef.current = controller;
		try {
			setIsDeleting(true);
			setError(null);
			await deleteOwnClientProfile(controller.signal);
			logout();
			navigate("/login", { replace: true });
		} catch (requestError) {
			if (
				requestError instanceof DOMException &&
				requestError.name === "AbortError"
			)
				return;
			setError(
				requestError instanceof HttpError
					? requestError.message
					: "Não foi possível excluir sua conta.",
			);
		} finally {
			if (!controller.signal.aborted) setIsDeleting(false);
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			title="Excluir conta"
			onClose={isDeleting ? () => undefined : onClose}
			footer={
				<>
					<Button
						variant="secondary"
						className="flex-1"
						disabled={isDeleting}
						onClick={onClose}
					>
						Cancelar
					</Button>
					<Button
						className="flex-1"
						disabled={isDeleting}
						onClick={() => void handleDelete()}
					>
						{isDeleting ? "Excluindo..." : "Sim, excluir"}
					</Button>
				</>
			}
		>
			<p className="text-gray-100 text-sm-regular">
				Deseja realmente excluir sua conta, {name}?
			</p>
			<p className="mt-3 text-gray-300 text-xs-regular">
				Esta ação remove seus chamados e não pode ser desfeita.
			</p>
			{error ? (
				<p role="alert" className="mt-4 text-danger text-xs-regular">
					{error}
				</p>
			) : null}
		</Modal>
	);
}
