import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../../../../components/ui/Avatar/Avatar";
import { Button } from "../../../../components/ui/Button/Button";
import { Input } from "../../../../components/ui/Input/Input";
import { PageState } from "../../../../components/ui/PageState/PageState";
import { HttpError } from "../../../../lib/http-error";
import { getUploadUrl } from "../../../../lib/upload-url";
import { AvailabilityPicker } from "../AvailabilityPicker";
import {
	createAdminTechnician,
	getAdminTechnician,
	updateAdminTechnician,
} from "../technician.api";
import { sortAvailability } from "../technician.utils";

type TechnicianFormValues = {
	name: string;
	email: string;
	password: string;
};

type AdminTechnicianFormPageProps = {
	mode: "create" | "edit";
};

export function AdminTechnicianFormPage({
	mode,
}: AdminTechnicianFormPageProps) {
	const { technicianId } = useParams();
	const navigate = useNavigate();
	const [availability, setAvailability] = useState<string[]>([]);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(mode === "edit");
	const [loadError, setLoadError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	const submitControllerRef = useRef<AbortController | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<TechnicianFormValues>({
		defaultValues: { name: "", email: "", password: "" },
	});

	useEffect(
		() => () => {
			submitControllerRef.current?.abort();
		},
		[],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: retryKey intentionally re-runs the request.
	useEffect(() => {
		if (mode !== "edit" || !technicianId) return;
		const controller = new AbortController();

		async function loadTechnician() {
			try {
				setIsLoading(true);
				setLoadError(null);
				const technician = await getAdminTechnician(
					technicianId as string,
					controller.signal,
				);
				reset({ name: technician.name, email: technician.email, password: "" });
				setAvatarUrl(technician.technicianProfile?.avatarUrl ?? null);
				setAvailability(
					sortAvailability(technician.technicianProfile?.availability ?? []),
				);
			} catch (requestError) {
				if (
					requestError instanceof DOMException &&
					requestError.name === "AbortError"
				)
					return;
				setLoadError("Não foi possível carregar o técnico.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		}

		void loadTechnician();
		return () => controller.abort();
	}, [mode, technicianId, reset, retryKey]);

	const onSubmit: SubmitHandler<TechnicianFormValues> = async (data) => {
		submitControllerRef.current?.abort();
		const controller = new AbortController();
		submitControllerRef.current = controller;
		try {
			setSubmitError(null);
			if (mode === "create") {
				await createAdminTechnician(
					{
						name: data.name.trim(),
						email: data.email.trim(),
						password: data.password,
						...(availability.length > 0 ? { availability } : {}),
					},
					controller.signal,
				);
			} else if (technicianId) {
				await updateAdminTechnician(
					technicianId,
					{
						name: data.name.trim(),
						email: data.email.trim(),
						availability,
					},
					controller.signal,
				);
			}
			navigate("/admin/technicians");
		} catch (requestError) {
			if (
				requestError instanceof DOMException &&
				requestError.name === "AbortError"
			)
				return;
			setSubmitError(
				requestError instanceof HttpError
					? requestError.message
					: "Não foi possível salvar o técnico.",
			);
		}
	};

	if (isLoading)
		return <PageState type="loading" message="Carregando técnico..." />;
	if (loadError)
		return (
			<PageState
				type="error"
				message={loadError}
				onRetry={() => setRetryKey((key) => key + 1)}
			/>
		);

	const technicianName = watch("name") || "Técnico";

	return (
		<section className="mx-auto w-full max-w-185">
			<button
				type="button"
				className="mb-2 inline-flex items-center gap-2 text-gray-300 text-xs-regular hover:text-gray-100"
				onClick={() => navigate("/admin/technicians")}
			>
				<ArrowLeftIcon className="h-4 w-4" /> Voltar
			</button>
			<form onSubmit={handleSubmit(onSubmit)}>
				<header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<h1 className="text-brand-dark text-xl-bold">Perfil de técnico</h1>
					<div className="grid grid-cols-2 gap-2">
						<Button
							variant="secondary"
							onClick={() => navigate("/admin/technicians")}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Salvando..." : "Salvar"}
						</Button>
					</div>
				</header>

				{submitError ? (
					<div
						className="mb-4 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-danger text-xs-bold"
						role="alert"
					>
						{submitError}
					</div>
				) : null}

				<div className="grid items-start gap-5 md:grid-cols-[0.75fr_1.25fr]">
					<section className="rounded-lg border border-gray-500 p-5">
						<h2 className="text-gray-100 text-sm-bold">Dados pessoais</h2>
						<p className="mt-1 mb-5 text-gray-400 text-xs-regular">
							Defina as informações do perfil de técnico
						</p>
						{mode === "edit" ? (
							<Avatar
								name={technicianName}
								src={getUploadUrl(avatarUrl)}
								className="mb-5 h-12 w-12"
							/>
						) : null}
						<div className="flex flex-col gap-4">
							<Input
								label="Nome"
								placeholder="Nome completo"
								error={errors.name?.message}
								{...register("name", {
									required: "Informe o nome",
									minLength: { value: 2, message: "Mínimo de 2 caracteres" },
									validate: (value) =>
										value.trim().length >= 2 || "Mínimo de 2 caracteres",
								})}
							/>
							<Input
								label="E-mail"
								type="email"
								placeholder="exemplo@email.com"
								error={errors.email?.message}
								{...register("email", {
									required: "Informe o e-mail",
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: "E-mail inválido",
									},
								})}
							/>
							{mode === "create" ? (
								<Input
									label="Senha"
									type="password"
									placeholder="Defina a senha de acesso"
									helperText="Mínimo de 5 dígitos"
									error={errors.password?.message}
									{...register("password", {
										required: "Informe a senha provisória",
										minLength: { value: 5, message: "Mínimo de 5 caracteres" },
									})}
								/>
							) : null}
						</div>
					</section>
					<section className="rounded-lg border border-gray-500 p-5">
						<h2 className="text-gray-100 text-sm-bold">
							Horários de atendimento
						</h2>
						<p className="mt-1 mb-5 text-gray-400 text-xs-regular">
							Selecione os horários de disponibilidade do técnico para
							atendimento
						</p>
						<AvailabilityPicker
							value={availability}
							onChange={setAvailability}
						/>
					</section>
				</div>
			</form>
		</section>
	);
}
