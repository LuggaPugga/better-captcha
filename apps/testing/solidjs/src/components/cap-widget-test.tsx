import { createCaptchaController } from "@better-captcha/solidjs";
import { type RenderParameters, CapWidget, type CapWidgetHandle } from "@better-captcha/solidjs/provider/cap-widget";
import { createSignal } from "solid-js";

export function CapWidgetTest() {
	const controller = createCaptchaController<CapWidgetHandle>();
	const [options, setOptions] = createSignal<RenderParameters>({});
	const [response, setResponse] = createSignal<string | null>(null);

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	return (
		<div>
			<CapWidget controller={controller} options={options()} endpoint="https://captcha.gurl.eu.org/api/" />
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
