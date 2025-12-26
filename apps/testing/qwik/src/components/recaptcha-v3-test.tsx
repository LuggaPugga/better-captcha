import { useCaptchaController } from "@better-captcha/qwik";
import { ReCaptchaV3, type ReCaptchaV3Handle, type RenderParameters } from "@better-captcha/qwik/provider/recaptcha-v3";
import { $, component$, useSignal } from "@builder.io/qwik";

export const RecaptchaV3Test = component$(() => {
	const controller = useCaptchaController<ReCaptchaV3Handle>();
	const options = useSignal<RenderParameters>({
		action: "submit",
	});
	const response = useSignal<string | null>(null);
	const solved = useSignal<boolean>(false);

	const handleSolve$ = $((token: string) => {
		solved.value = true;
		console.log("Captcha solved with token:", token);
	});

	return (
		<div>
			<ReCaptchaV3
				controller={controller}
				options={options.value}
				sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
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
					const actions = ["submit", "login", "register"];
					const currentIndex = actions.indexOf(options.value.action);
					const nextIndex = (currentIndex + 1) % actions.length;
					options.value = { action: actions[nextIndex] };
				}}
			>
				Change Action
			</button>
			{response.value && <p id="captcha-response">{response.value}</p>}
		</div>
	);
});
