import { ImageUpIcon } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar } from "../../../components/ui/Avatar/Avatar";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { Modal } from "../../../components/ui/Modal/Modal";
import { PageState } from "../../../components/ui/PageState/PageState";
import { Tag } from "../../../components/ui/Tag/Tag";
import { HttpError } from "../../../lib/http-error";
import { getUploadUrl } from "../../../lib/upload-url";
import { useAuth } from "../../auth/auth.store";
import {
	getOwnTechnicianProfile,
	updateOwnTechnicianAvatar,
	updateOwnTechnicianProfile,
} from "./technician-profile.api";
import type {
	TechnicianOwnProfile,
	TechnicianProfileMutationResponse,
	UpdateOwnTechnicianProfileInput,
} from "./technician-profile.types";

type TechnicianProfileModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

function mergeProfileMutation(
	currentProfile: TechnicianOwnProfile | null,
	mutation: TechnicianProfileMutationResponse,
): TechnicianOwnProfile | null {
	if (!currentProfile) return currentProfile;

	return {
		...currentProfile,
		name: mutation.user.name,
		email: mutation.user.email,
		technicianProfile: currentProfile.technicianProfile
			? {
					...currentProfile.technicianProfile,
					avatarUrl: mutation.profile.avatarUrl,
					availability:
						mutation.profile.availability ??
						currentProfile.technicianProfile.availability,
				}
			: null,
	};
}

export function TechnicianProfileModal({
	isOpen,
	onClose,
}: TechnicianProfileModalProps) {
	const { updateUser } = useAuth();
	const [profile, setProfile] = useState<TechnicianOwnProfile | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [retryKey, setRetryKey] = useState(0);
	const loadControllerRef = useRef<AbortController | null>(null);
	const uploadControllerRef = useRef<AbortController | null>(null);
	const formId = "technician-profile-form";
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<UpdateOwnTechnicianProfileInput>();

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
		loadControllerRef.current?.abort();
		const controller = new AbortController();
		loadControllerRef.current = controller;

		async function loadProfile() {
			try {
				setIsLoading(true);
				setLoadError(null);
				const currentProfile = await getOwnTechnicianProfile(controller.signal);
				setProfile(currentProfile);
				reset({ name: currentProfile.name, email: currentProfile.email });
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError")
					return;
				setLoadError("Não foi possível carregar o perfil.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}

		void loadProfile();
		return () => controller.abort();
	}, [isOpen, reset, retryKey]);

	async function handleProfileUpdate(input: UpdateOwnTechnicianProfileInput) {
		try {
			const updatedProfile = await updateOwnTechnicianProfile({
				name: input.name.trim(),
				email: input.email.trim(),
			});
			setProfile((currentProfile) =>
				mergeProfileMutation(currentProfile, updatedProfile),
			);
			updateUser({
				name: updatedProfile.user.name,
				email: updatedProfile.user.email,
			});
			onClose();
		} catch (error) {
			setError("root", {
				message:
					error instanceof HttpError
						? error.message
						: "Não foi possível atualizar o perfil.",
			});
		}
	}

	async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		uploadControllerRef.current?.abort();
		const controller = new AbortController();
		uploadControllerRef.current = controller;

		try {
			setIsUploading(true);
			setUploadError(null);
			const updatedProfile = await updateOwnTechnicianAvatar(
				file,
				controller.signal,
			);
			setProfile((currentProfile) =>
				mergeProfileMutation(currentProfile, updatedProfile),
			);
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			setUploadError(
				error instanceof HttpError
					? error.message
					: "Não foi possível enviar a imagem.",
			);
		} finally {
			if (!controller.signal.aborted) setIsUploading(false);
			event.target.value = "";
		}
	}

	const isBusy = isSubmitting || isUploading;

	return (
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
							src={getUploadUrl(profile.technicianProfile?.avatarUrl)}
							size="md"
							className="h-12 w-12 text-sm-bold"
						/>
						<label className="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-gray-500 px-3 py-2 text-xs-bold text-gray-100 transition-colors hover:bg-gray-400">
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
					<section>
						<h3 className="text-gray-300 text-xs-bold">Disponibilidade</h3>
						<p className="mt-1 text-gray-400 text-xs-regular">
							Horários de atendimento definidos pelo administrador.
						</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{profile.technicianProfile?.availability.length ? (
								profile.technicianProfile.availability.map((time) => (
									<Tag key={time} variant="readOnly">
										{time}
									</Tag>
								))
							) : (
								<p className="text-gray-400 text-xs-regular">
									Sem disponibilidade definida.
								</p>
							)}
						</div>
					</section>
					{errors.root?.message ? (
						<p role="alert" className="text-danger text-xs-regular">
							{errors.root.message}
						</p>
					) : null}
				</form>
			)}
		</Modal>
	);
}
