import { createCaptchaController } from "@better-captcha/solid";
import {
	FriendlyCaptcha,
	type FriendlyCaptchaHandle,
	type RenderParameters,
} from "@better-captcha/solid/provider/friendly-captcha";
import { createSignal } from "solid-js";

export function FriendlyCaptchaTest() {
	const controller = createCaptchaController<FriendlyCaptchaHandle>();
	const [options, setOptions] = createSignal<Omit<RenderParameters, "sitekey" | "element">>({
		theme: "light",
		startMode: "focus",
	});
	const [response, setResponse] = createSignal<string | null>(null);

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	return (
		<div>
			<FriendlyCaptcha controller={controller} sitekey="FC-00000000-0000-0000-0000-000000000000" options={options()} />
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
					const currentIndex = themes.indexOf(options().theme || "auto");
					const nextIndex = (currentIndex + 1) % themes.length;
					setOptions({ ...options(), theme: themes[nextIndex] as "light" | "dark" | "auto" });
				}}
			>
				Change Theme
			</button>
			{response() && <p id="captcha-response">{response()}</p>}
		</div>
	);
}
