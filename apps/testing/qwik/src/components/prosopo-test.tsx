import { useCaptchaController } from "@better-captcha/qwik";
import { Prosopo, type ProsopoHandle, type RenderParameters } from "@better-captcha/qwik/provider/prosopo";
import { $, component$, useSignal } from "@builder.io/qwik";

export const ProsopoTest = component$(() => {
	const controller = useCaptchaController<ProsopoHandle>();
	const options = useSignal<Omit<RenderParameters, "siteKey">>({
		theme: "light",
		callback: $((response: string) => {
			console.log("Prosopo CAPTCHA verified:", response);
		}),
		"error-callback": $((error: string) => {
			console.error("Prosopo CAPTCHA error:", error);
		}),
	});
	const response = useSignal<string | null>(null);

	return (
		<div>
			<Prosopo controller={controller} options={options.value} sitekey="no_test_site_key" />
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
					controller.value?.execute();
				}}
			>
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
					const captchaResponse = controller.value?.getResponse() || "No response";
					response.value = captchaResponse;
				}}
			>
				Get Response
			</button>
			<button
				type="button"
				onClick$={() => {
					const themes = ["light", "dark"];
					const currentTheme = options.value.theme || "light";
					const currentIndex = themes.indexOf(currentTheme as string);
					const nextIndex = (currentIndex + 1) % themes.length;
					options.value = {
						...options.value,
						theme: themes[nextIndex] as RenderParameters["theme"],
					};
				}}
			>
				Change Theme
			</button>
			{response.value && <p id="captcha-response">{response.value}</p>}
		</div>
	);
});
