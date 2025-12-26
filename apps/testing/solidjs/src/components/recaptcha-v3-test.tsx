import { createCaptchaController } from "@better-captcha/solidjs";
import {
	ReCaptchaV3,
	type ReCaptchaV3Handle,
	type RenderParameters,
} from "@better-captcha/solidjs/provider/recaptcha-v3";
import { createSignal } from "solid-js";

export function RecaptchaV3Test() {
	const controller = createCaptchaController<ReCaptchaV3Handle>();
	const [options, setOptions] = createSignal<RenderParameters>({
		action: "submit",
	});
	const [response, setResponse] = createSignal<string | null>(null);
	const [solved, setSolved] = createSignal<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<ReCaptchaV3
				controller={controller}
				sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
				options={options()}
				onSolve={handleSolve}
			/>
			{solved() && <p id="captcha-solved">Captcha Solved!</p>}
			<button type="button" onClick={() => controller.handle()?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => controller.handle()?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => controller.handle()?.execute()}>
				Execute
			</button>
			<button type="button" onClick={async () => await controller.handle()?.render()}>
				Render
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			<button
				type="button"
				onClick={() => {
					const actions = ["submit", "login", "register"];
					const currentIndex = actions.indexOf(options().action);
					const nextIndex = (currentIndex + 1) % actions.length;
					setOptions({ action: actions[nextIndex] });
				}}
			>
				Change Action
			</button>
			{response() && <p id="captcha-response">{response()}</p>}
		</div>
	);
}
