import { useCaptchaController } from "@better-captcha/qwik";
import { TSec, type TSecHandle } from "@better-captcha/qwik/provider/t-sec";
import { $, component$, useSignal } from "@builder.io/qwik";

export const TSecTest = component$(() => {
	const controller = useCaptchaController<TSecHandle>();
	const response = useSignal<string | false>(false);
	const solved = useSignal<boolean>(false);

	const handleSolve$ = $((token: string) => {
		solved.value = true;
		console.log("Captcha solved with token:", token);
	});

	return (
		<div>
			<TSec controller={controller} sitekey="189905409" onSolve$={handleSolve$} options={{ userLanguage: "en" }} />
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
					const captchaResponse = controller.value?.getResponse() ?? false;
					response.value = captchaResponse;
				}}
			>
				Get Response
			</button>
			{response.value && <p id="captcha-response">{JSON.stringify(response.value, null, "\t")}</p>}
		</div>
	);
});
