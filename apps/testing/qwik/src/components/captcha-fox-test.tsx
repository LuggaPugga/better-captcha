import { useCaptchaController } from "@better-captcha/qwik";
import { CaptchaFox, type CaptchaFoxHandle, type RenderParameters } from "@better-captcha/qwik/provider/captcha-fox";
import { component$, useSignal } from "@builder.io/qwik";

export const CaptchaFoxTest = component$(() => {
	const controller = useCaptchaController<CaptchaFoxHandle>();
	const options = useSignal<Omit<RenderParameters, "sitekey">>({
		theme: "light",
		mode: "inline",
	});
	const response = useSignal<string | null>(null);

	return (
		<div>
			<CaptchaFox controller={controller} options={options.value} sitekey="sk_11111111000000001111111100000000" />
			<button
				type="button"
				onClick$={() => {
					controller.value?.destroy();
				}}
			>
				Destroy
			</button>
			<button
				type="button"
				onClick$={() => {
					controller.value?.reset();
				}}
			>
				Reset
			</button>
			<button
				type="button"
				onClick$={() => {
					const captchaResponse = controller.value?.getResponse() || "No response";
					response.value = captchaResponse;
				}}
			>
				Get Response
			</button>
			<button type="button" onClick$={() => controller.value?.execute()}>
				Execute
			</button>
			<button
				type="button"
				onClick$={async () => {
					await controller.value?.render();
				}}
			>
				Render
			</button>
			<button
				type="button"
				onClick$={() => {
					const themes = ["light", "dark", "auto"];
					const currentTheme = options.value.theme;
					const currentIndex = themes.indexOf(typeof currentTheme === "string" ? currentTheme : "light");
					const nextIndex = (currentIndex + 1) % themes.length;
					options.value = { ...options.value, theme: themes[nextIndex] as RenderParameters["theme"] };
				}}
			>
				Change Theme
			</button>
			{response.value && <p id="captcha-response">{response.value}</p>}
		</div>
	);
});
