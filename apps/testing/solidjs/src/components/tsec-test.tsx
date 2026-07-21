import { createCaptchaController } from "@better-captcha/solidjs";
import { TSec, type TSecHandle } from "@better-captcha/solidjs/provider/t-sec";
import { createSignal } from "solid-js";
import { type CaptchaComponentMode, RenderCaptcha } from "./render-captcha";

export function TSecTest(props: { mode: CaptchaComponentMode }) {
	const controller = createCaptchaController<TSecHandle>();
	const [response, setResponse] = createSignal<ReturnType<TSecHandle["getResponse"]>>(null);
	const [solved, setSolved] = createSignal<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() ?? null;
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<RenderCaptcha
				mode={props.mode}
				provider="t-sec"
				component={TSec}
				controller={controller}
				sitekey="189910271"
				onSolve={handleSolve}
				options={{ userLanguage: "en" }}
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
			{response() && <p id="captcha-response">{JSON.stringify(response(), null, "\t")}</p>}
		</div>
	);
}
