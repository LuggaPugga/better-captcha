import { createCaptchaController } from "@better-captcha/solidjs";
import { ReCaptcha, type ReCaptchaHandle, type RenderParameters } from "@better-captcha/solidjs/provider/recaptcha";
import { createSignal } from "solid-js";

export function RecaptchaTest() {
	const controller = createCaptchaController<ReCaptchaHandle>();
	const [options, setOptions] = createSignal<Omit<RenderParameters, "sitekey">>({
		theme: "light",
		size: "normal",
	});
	const [response, setResponse] = createSignal<string | null>(null);
	const [solved, setSolved] = createSignal<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<ReCaptcha
				controller={controller}
				sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
				options={options()}
				onSolve={handleSolve}
			/>
			{solved() && <p id="captcha-solved">Captcha Solved!</p>}
			<button type="button" onClick={() => controller.handle()?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => controller.handle()?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => controller.handle()?.execute()}>
				Execute
			</button>
			<button type="button" onClick={async () => await controller.handle()?.render()}>
				Render
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			<button
				type="button"
				onClick={() => {
					const themes = ["light", "dark", "auto"];
					const currentIndex = themes.indexOf(options().theme || "auto");
					const nextIndex = (currentIndex + 1) % themes.length;
					setOptions({ ...options(), theme: themes[nextIndex] as RenderParameters["theme"] });
				}}
			>
				Change Theme
			</button>
			{response() && <p id="captcha-response">{response()}</p>}
		</div>
	);
}
