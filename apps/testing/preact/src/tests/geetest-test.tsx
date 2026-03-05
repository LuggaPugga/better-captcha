import { Geetest, type GeetestHandle, type RenderParameters } from "@better-captcha/preact/provider/geetest";
import { useRef, useState } from "preact/hooks";

export function GeetestTest() {
	const geetestRef = useRef<GeetestHandle>(null);
	const [options, setOptions] = useState<RenderParameters>({
		language: "eng",
	});
	const [response, setResponse] = useState<ReturnType<GeetestHandle["getResponse"]> | null>(null);
	const [solved, setSolved] = useState<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = geetestRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<Geetest ref={geetestRef} sitekey="08649cc61c7078689263ebf78225d616" options={options} onSolve={handleSolve} />
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
