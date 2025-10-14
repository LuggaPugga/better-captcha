import { createCaptchaController } from "@better-captcha/solid";
import { HCaptcha, type HCaptchaHandle, type RenderParameters } from "@better-captcha/solid/provider/hcaptcha";
import { createSignal } from "solid-js";

export function HCaptchaTest() {
	const controller = createCaptchaController<HCaptchaHandle>();
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
			<HCaptcha controller={controller} sitekey="10000000-ffff-ffff-ffff-000000000001" options={options()} />
			<button type="button" onClick={() => controller.handle()?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => controller.handle()?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => controller.handle()?.execute()}>
				Execute
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			<button
				type="button"
				onClick={() => {
					const themes = ["light", "dark", "auto"];
					const currentIndex = themes.indexOf(options().theme ?? "light");
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
