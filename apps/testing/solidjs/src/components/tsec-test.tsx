import { createCaptchaController } from "@better-captcha/solidjs";
import { TSec, type TSecHandle } from "@better-captcha/solidjs/provider/t-sec";
import { createSignal } from "solid-js";

export function TSecTest() {
	const controller = createCaptchaController<TSecHandle>();
	const [response, setResponse] = createSignal<string | false>(false);
	const [solved, setSolved] = createSignal<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() ?? false;
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<TSec controller={controller} sitekey="189905409" onSolve={handleSolve} options={{ userLanguage: "en" }} />
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
