import { CircleAlertIcon } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import loginBackground from "../../../assets/background.png";
import helpdeskLogo from "../../../assets/Logo_IconDark.png";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { HttpError } from "../../../lib/http-error";
import { login } from "../auth.api";
import { getRedirectPathByRole } from "../auth.redirects";
import { useAuth } from "../auth.store";
import type { LoginInput } from "../auth.types";

const loginPageStyle = {
	"--login-background": `url(${loginBackground})`,
} as CSSProperties;

export function LoginPage() {
	const { setAuth } = useAuth();
	const [loginError, setLoginError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginInput>();
	const navigate = useNavigate();

	const onSubmitForm: SubmitHandler<LoginInput> = async (data) => {
		try {
			setLoginError(null);

			const result = await login(data);

			if (!result.token) {
				setLoginError("Resposta inválida do servidor.");
				return;
			}

			setAuth({ token: result.token, user: result.user });
			navigate(getRedirectPathByRole(result.user.role));
		} catch (error) {
			if (error instanceof HttpError) {
				setLoginError(error.message);
				return;
			}

			setLoginError("Não foi possível entrar. Tente novamente.");
		}
	};

	return (
		<main
			className="login-page-background min-h-screen p-7 font-sans md:flex md:min-h-0 md:p-0"
			style={loginPageStyle}
		>
			<section
				className="hidden md:block md:h-full md:w-1/2"
				aria-hidden="true"
			/>

			<section
				className="relative mx-auto min-h-161.5 max-w-81.5 overflow-hidden rounded-t-2xl rounded-b-3xl bg-gray-600 bg-[linear-gradient(180deg,#10216b_0_72px,transparent_72px)] pt-6 md:mx-0 md:flex md:h-full md:min-h-0 md:w-1/2 md:max-w-none md:items-start md:justify-center md:overflow-visible md:rounded-tl-3xl md:rounded-tr-none md:rounded-b-none md:bg-gray-600 md:bg-none md:px-6 md:pt-16 md:pb-10"
				aria-labelledby="login-title"
			>
				<div className="min-h-155 w-full rounded-t-2xl rounded-b-3xl bg-gray-600 px-5 pt-8 pb-10 md:min-h-0 md:max-w-97.5 md:rounded-none md:bg-transparent md:px-0 md:pt-0 md:pb-0">
					<header className="mb-7 flex items-center justify-center gap-3 text-brand-dark text-lg-bold md:mb-9">
						<img
							src={helpdeskLogo}
							alt=""
							className="h-9 w-9"
							aria-hidden="true"
						/>
						<strong>HelpDesk</strong>
					</header>

					<form
						onSubmit={handleSubmit(onSubmitForm)}
						className="flex flex-col gap-7 rounded-lg border border-gray-500 bg-white p-5 md:p-8"
					>
						<div>
							<h1 id="login-title" className="text-lg-bold text-gray-100">
								Acesse o portal
							</h1>
							<p className="mt-0.5 text-sm text-gray-300">
								Entre usando seu e-mail e senha cadastrados
							</p>
						</div>

						<div className="flex flex-col gap-3">
							<Input
								{...register("email", { required: true })}
								label="E-mail"
								type="email"
								name="email"
								placeholder="exemplo@mail.com"
								autoComplete="email"
							/>
							{errors.email && (
								<span className="text-danger text-xs-bold">
									Informe o seu e-mail
								</span>
							)}

							<Input
								{...register("password", { required: true })}
								label="Senha"
								type="password"
								name="password"
								placeholder="Digite sua senha"
								autoComplete="current-password"
							/>
							{errors.password && (
								<span className="text-danger text-xs-bold">
									Informe sua senha
								</span>
							)}
						</div>

						{loginError && (
							<div
								className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-danger text-xs-bold"
								role="alert"
							>
								<CircleAlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
								<span>{loginError}</span>
							</div>
						)}

						<Button type="submit" className="w-full">
							Entrar
						</Button>
					</form>

					<section className="mt-3 flex flex-col gap-6 rounded-lg border border-gray-500 bg-white p-5 md:p-8">
						<div>
							<h2 className="text-sm-bold text-gray-100">
								Ainda nao tem uma conta?
							</h2>
							<p className="mt-0.5 text-xxs text-gray-300">
								Cadastre agora mesmo
							</p>
						</div>

						<Button variant="secondary" className="w-full">
							Criar conta
						</Button>
					</section>
				</div>
			</section>
		</main>
	);
}
