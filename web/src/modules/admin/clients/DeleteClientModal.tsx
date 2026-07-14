import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/Button/Button";
import { Modal } from "../../../components/ui/Modal/Modal";
import { HttpError } from "../../../lib/http-error";
import { deleteAdminClient } from "./client.api";
import type { AdminClient } from "./client.types";

type DeleteClientModalProps = {
	client: AdminClient | null;
	onClose: () => void;
	onSuccess: () => void;
};

export function DeleteClientModal({
	client,
	onClose,
	onSuccess,
}: DeleteClientModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const deleteControllerRef = useRef<AbortController | null>(null);

	useEffect(
		() => () => {
			deleteControllerRef.current?.abort();
		},
		[],
	);

	async function handleDelete() {
		if (!client || isDeleting) return;
		deleteControllerRef.current?.abort();
		const controller = new AbortController();
		deleteControllerRef.current = controller;

		try {
			setIsDeleting(true);
			setDeleteError(null);
			await deleteAdminClient(client.id, controller.signal);
			onSuccess();
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			setDeleteError(
				error instanceof HttpError
					? error.message
					: "Não foi possível excluir o cliente.",
			);
		} finally {
			if (!controller.signal.aborted) setIsDeleting(false);
		}
	}

	return (
		<Modal
			isOpen={Boolean(client)}
			title="Excluir cliente"
			onClose={isDeleting ? () => undefined : onClose}
			footer={
				<>
					<Button
						variant="secondary"
						className="flex-1"
						onClick={onClose}
						disabled={isDeleting}
					>
						Cancelar
					</Button>
					<Button
						className="flex-1"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Excluindo..." : "Sim, excluir"}
					</Button>
				</>
			}
		>
			<div className="space-y-4 text-gray-100 text-sm-regular">
				<p>
					Deseja realmente excluir <strong>{client?.name}</strong>?
				</p>
				<p>
					Ao excluir, todos os chamados deste cliente serão removidos e esta
					ação não poderá ser desfeita.
				</p>
				{deleteError ? (
					<p role="alert" className="text-danger text-xs-regular">
						{deleteError}
					</p>
				) : null}
			</div>
		</Modal>
	);
}
