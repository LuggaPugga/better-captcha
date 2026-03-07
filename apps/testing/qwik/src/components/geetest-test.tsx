import { useCaptchaController } from "@better-captcha/qwik";
import {
	Geetest,
	type GeetestHandle,
	type GeetestSolveResponse,
	type RenderParameters,
} from "@better-captcha/qwik/provider/geetest";
import { $, component$, useSignal } from "@builder.io/qwik";

export const GeetestTest = component$(() => {
	const controller = useCaptchaController<GeetestHandle>();
	const options = useSignal<RenderParameters>({
		language: "eng",
	});
	const response = useSignal<string | null>(null);
	const solved = useSignal<boolean>(false);

	const handleSolve$ = $((token: GeetestSolveResponse) => {
		solved.value = true;
		console.log("Captcha solved with token:", token);
	});

	return (
		<div>
			<Geetest
				controller={controller}
				options={options.value}
				sitekey="647f5ed2ed8acb4be36784e01556bb71"
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
					response.value = JSON.stringify(captchaResponse, null, "\t");
				}}
			>
				Get Response
			</button>
			{response.value && <p id="captcha-response">{response.value}</p>}
		</div>
	);
});
