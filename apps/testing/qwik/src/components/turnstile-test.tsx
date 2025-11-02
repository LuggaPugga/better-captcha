import { useCaptchaController } from "@better-captcha/qwik";
import { type RenderParameters, Turnstile, type TurnstileHandle } from "@better-captcha/qwik/provider/turnstile";
import { $, component$, useSignal } from "@builder.io/qwik";

export const TurnstileTest = component$(() => {
	const controller = useCaptchaController<TurnstileHandle>();
	const options = useSignal<Omit<RenderParameters, "sitekey">>({
		theme: "light",
		size: "normal",
	});
	const response = useSignal<string | null>(null);
	const solved = useSignal<boolean>(false);

	const handleSolve$ = $((token: string) => {
		solved.value = true;
		console.log("Captcha solved with token:", token);
	});

	return (
		<div>
			<Turnstile
				controller={controller}
				options={options.value}
				sitekey="1x00000000000000000000AA"
				onSolve$={handleSolve$}
			/>
			{solved.value && <p id="captcha-solved">Captcha Solved!</p>}
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
					const themes = ["light", "dark", "auto"];
					const currentIndex = themes.indexOf(options.value.theme || "auto");
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
