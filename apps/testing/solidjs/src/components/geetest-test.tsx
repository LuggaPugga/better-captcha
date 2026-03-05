import { createCaptchaController } from "@better-captcha/solidjs";
import { Geetest, type GeetestHandle, type RenderParameters } from "@better-captcha/solidjs/provider/geetest";
import { createSignal } from "solid-js";

export function GeetestTest() {
	const controller = createCaptchaController<GeetestHandle>();
	const [options, setOptions] = createSignal<Omit<RenderParameters, "captchaId">>({
		language: "eng",
	});
	const [response, setResponse] = createSignal<string | null>(null);
	const [solved, setSolved] = createSignal<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() || "No response";
		setResponse(JSON.stringify(captchaResponse, null, "\t"));
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<Geetest
				controller={controller}
				sitekey="08649cc61c7078689263ebf78225d616"
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
			{response() && <p id="captcha-response">{response()}</p>}
		</div>
	);
}
