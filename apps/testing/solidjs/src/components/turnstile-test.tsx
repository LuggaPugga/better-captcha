import { createCaptchaController } from "@better-captcha/solidjs";
import { type RenderParameters, Turnstile, type TurnstileHandle } from "@better-captcha/solidjs/provider/turnstile";
import { createSignal } from "solid-js";

export function TurnstileTest() {
	const controller = createCaptchaController<TurnstileHandle>();
	const [options, setOptions] = createSignal<Omit<RenderParameters, "sitekey">>({
		theme: "light",
		size: "normal",
	});
	const [response, setResponse] = createSignal<string | null>(null);

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	return (
		<div>
			<Turnstile controller={controller} options={options()} sitekey="1x00000000000000000000AA" />
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
