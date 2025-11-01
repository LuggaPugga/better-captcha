import { createCaptchaController } from "@better-captcha/solidjs";
import { CapWidget, type CapWidgetHandle, type RenderParameters } from "@better-captcha/solidjs/provider/cap-widget";
import { createSignal } from "solid-js";

export function CapWidgetTest() {
	const controller = createCaptchaController<CapWidgetHandle>();
	const [options, setOptions] = createSignal<RenderParameters>({});
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
			<CapWidget controller={controller} options={options()} endpoint="https://captcha.gurl.eu.org/api/" onSolve={handleSolve} />
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
			{response() && <p id="captcha-response">{response()}</p>}
		</div>
	);
}
