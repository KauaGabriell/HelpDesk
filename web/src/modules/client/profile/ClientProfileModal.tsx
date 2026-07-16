import { ImageUpIcon, KeyRoundIcon, Trash2Icon } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar } from "../../../components/ui/Avatar/Avatar";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { Modal } from "../../../components/ui/Modal/Modal";
import { PageState } from "../../../components/ui/PageState/PageState";
import { HttpError } from "../../../lib/http-error";
import { getUploadUrl } from "../../../lib/upload-url";
import { useAuth } from "../../auth/auth.store";
import { ClientChangePasswordModal } from "./ClientChangePasswordModal";
import {
	getOwnClientProfile,
	updateOwnClientAvatar,
	updateOwnClientProfile,
} from "./client-profile.api";
import type {
	ClientOwnProfile,
	UpdateOwnClientProfileInput,
} from "./client-profile.types";
import { mergeClientProfileMutation } from "./client-profile.utils";
import { DeleteClientAccountModal } from "./DeleteClientAccountModal";

type ClientProfileModalProps = { isOpen: boolean; onClose: () => void };

export function ClientProfileModal({
	isOpen,
	onClose,
}: ClientProfileModalProps) {
	const { updateUser } = useAuth();
	const [profile, setProfile] = useState<ClientOwnProfile | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [retryKey, setRetryKey] = useState(0);
	const [isPasswordOpen, setIsPasswordOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const loadControllerRef = useRef<AbortController | null>(null);
	const uploadControllerRef = useRef<AbortController | null>(null);
	const formId = "client-profile-form";
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<UpdateOwnClientProfileInput>();

	useEffect(
		() => () => {
			loadControllerRef.current?.abort();
			uploadControllerRef.current?.abort();
		},
		[],
	);
	useEffect(() => {
		if (!isOpen) return;
		void retryKey;
		const controller = new AbortController();
		loadControllerRef.current?.abort();
		loadControllerRef.current = controller;
		async function loadProfile() {
			try {
				setIsLoading(true);
				setLoadError(null);
				const currentProfile = await getOwnClientProfile(controller.signal);
				setProfile(currentProfile);
				reset({ name: currentProfile.name, email: currentProfile.email });
			} catch (requestError) {
				if (
					requestError instanceof DOMException &&
					requestError.name === "AbortError"
				)
					return;
				setLoadError("Não foi possível carregar o perfil.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}
		void loadProfile();
		return () => controller.abort();
	}, [isOpen, reset, retryKey]);

	async function handleProfileUpdate(input: UpdateOwnClientProfileInput) {
		try {
			const mutation = await updateOwnClientProfile({
				name: input.name.trim(),
				email: input.email.trim(),
			});
			setProfile((current) => mergeClientProfileMutation(current, mutation));
			updateUser({ name: mutation.user.name, email: mutation.user.email });
			onClose();
		} catch (requestError) {
			setError("root", {
				message:
					requestError instanceof HttpError
						? requestError.message
						: "Não foi possível atualizar o perfil.",
			});
		}
	}
	async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;
		const controller = new AbortController();
		uploadControllerRef.current?.abort();
		uploadControllerRef.current = controller;
		try {
			setIsUploading(true);
			setUploadError(null);
			const mutation = await updateOwnClientAvatar(file, controller.signal);
			setProfile((current) => mergeClientProfileMutation(current, mutation));
		} catch (requestError) {
			if (
				requestError instanceof DOMException &&
				requestError.name === "AbortError"
			)
				return;
			setUploadError(
				requestError instanceof HttpError
					? requestError.message
					: "Não foi possível enviar a imagem.",
			);
		} finally {
			if (!controller.signal.aborted) setIsUploading(false);
			event.target.value = "";
		}
	}
	const isBusy = isSubmitting || isUploading;
	function openPassword() {
		onClose();
		setIsPasswordOpen(true);
	}
	function openDelete() {
		onClose();
		setIsDeleteOpen(true);
	}

	return (
		<>
			<Modal
				isOpen={isOpen}
				title="Perfil"
				onClose={isBusy ? () => undefined : onClose}
				footer={
					<Button
						type="submit"
						form={formId}
						className="w-full"
						disabled={isBusy}
					>
						{isSubmitting ? "Salvando..." : "Salvar"}
					</Button>
				}
			>
				{isLoading ? (
					<PageState type="loading" message="Carregando perfil..." />
				) : loadError || !profile ? (
					<PageState
						type="error"
						message={loadError ?? "Perfil não encontrado."}
						onRetry={() => setRetryKey((key) => key + 1)}
					/>
				) : (
					<form
						id={formId}
						className="flex flex-col gap-5"
						onSubmit={handleSubmit(handleProfileUpdate)}
					>
						<div className="flex items-center gap-3">
							<Avatar
								name={profile.name}
								src={getUploadUrl(profile.clientProfile?.avatarUrl)}
								size="md"
								className="h-12 w-12 text-sm-bold"
							/>
							<label className="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-gray-500 px-3 py-2 text-xs-bold text-gray-100 hover:bg-gray-400">
								<ImageUpIcon className="h-4 w-4" />
								{isUploading ? "Enviando..." : "Nova imagem"}
								<input
									type="file"
									accept="image/jpeg,image/jpg,image/png"
									className="sr-only"
									disabled={isBusy}
									onChange={handleAvatarChange}
								/>
							</label>
						</div>
						{uploadError ? (
							<p role="alert" className="text-danger text-xs-regular">
								{uploadError}
							</p>
						) : null}
						<Input
							label="Nome"
							error={errors.name?.message}
							{...register("name", {
								required: "Informe seu nome.",
								validate: (value) =>
									value.trim().length >= 2 || "Informe ao menos 2 caracteres.",
							})}
						/>
						<Input
							label="E-mail"
							type="email"
							error={errors.email?.message}
							{...register("email", {
								required: "Informe seu e-mail.",
								pattern: {
									value: /^\S+@\S+\.\S+$/,
									message: "Informe um e-mail válido.",
								},
							})}
						/>
						<div className="flex items-center justify-between border-gray-500 border-t pt-5">
							<span className="text-gray-300 text-xs-bold">Senha</span>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								icon={<KeyRoundIcon />}
								onClick={openPassword}
							>
								Alterar
							</Button>
						</div>
						<Button
							type="button"
							variant="link"
							className="self-start text-danger"
							icon={<Trash2Icon />}
							onClick={openDelete}
						>
							Excluir conta
						</Button>
						{errors.root?.message ? (
							<p role="alert" className="text-danger text-xs-regular">
								{errors.root.message}
							</p>
						) : null}
					</form>
				)}
			</Modal>
			<ClientChangePasswordModal
				isOpen={isPasswordOpen}
				onClose={() => setIsPasswordOpen(false)}
			/>
			{profile ? (
				<DeleteClientAccountModal
					isOpen={isDeleteOpen}
					name={profile.name}
					onClose={() => setIsDeleteOpen(false)}
				/>
			) : null}
		</>
	);
}
