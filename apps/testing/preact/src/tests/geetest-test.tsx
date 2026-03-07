import {
	Geetest,
	type GeetestHandle,
	type GeetestSolveResponse,
	type RenderParameters,
} from "@better-captcha/preact/provider/geetest";
import { useRef, useState } from "preact/hooks";

export function GeetestTest() {
	const geetestRef = useRef<GeetestHandle>(null);
	const options: RenderParameters = {
		language: "eng",
	};
	const [response, setResponse] = useState<ReturnType<GeetestHandle["getResponse"]> | null>(null);
	const [solved, setSolved] = useState<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = geetestRef.current?.getResponse() ?? false;
		setResponse(captchaResponse);
	};

	const handleSolve = (token: GeetestSolveResponse) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<Geetest ref={geetestRef} sitekey="647f5ed2ed8acb4be36784e01556bb71" options={options} onSolve={handleSolve} />
			{solved && <p id="captcha-solved">Captcha Solved!</p>}
			<button type="button" onClick={() => geetestRef.current?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => geetestRef.current?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => geetestRef.current?.execute()}>
				Execute
			</button>
			<button type="button" onClick={() => geetestRef.current?.render()}>
				Render
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			{response && <p id="captcha-response">{JSON.stringify(response, null, "\t")}</p>}
		</div>
	);
}
