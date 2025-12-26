import { useCaptchaController } from "@better-captcha/qwik";
import { Altcha, type AltchaHandle, type RenderParameters } from "@better-captcha/qwik/provider/altcha";
import { $, component$, useSignal } from "@builder.io/qwik";

export const AltchaTest = component$(() => {
	const controller = useCaptchaController<AltchaHandle>();
	const options = useSignal<RenderParameters>({});
	const response = useSignal<string | null>(null);
	const solved = useSignal<boolean>(false);

	const handleSolve$ = $((token: string) => {
		solved.value = true;
		console.log("Captcha solved with token:", token);
	});

	return (
		<div>
			<Altcha
				controller={controller}
				options={options.value}
				endpoint="https://eu.altcha.org/api/v1/challenge?apiKey=ckey_c82e4cb6f2f34eb0a99fb3fbc4c9"
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
			{response.value && <p id="captcha-response">{response.value}</p>}
		</div>
	);
});
