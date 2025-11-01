import { useCaptchaController } from "@better-captcha/qwik";
import { CapWidget, type CapWidgetHandle, type RenderParameters } from "@better-captcha/qwik/provider/cap-widget";
import { $, component$, useSignal } from "@builder.io/qwik";

export const CapWidgetTest = component$(() => {
	const controller = useCaptchaController<CapWidgetHandle>();
	const options = useSignal<RenderParameters>({});
	const response = useSignal<string | null>(null);
	const solved = useSignal<boolean>(false);

	const handleSolve$ = $((token: string) => {
		solved.value = true;
		console.log("Captcha solved with token:", token);
	});

	return (
		<div>
			<CapWidget controller={controller} options={options.value} endpoint="https://captcha.gurl.eu.org/api/" onSolve$={handleSolve$} />
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
