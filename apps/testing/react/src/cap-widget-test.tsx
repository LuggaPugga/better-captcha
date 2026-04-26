import { type RenderParameters, CapWidget, type CapWidgetHandle } from "@better-captcha/react/provider/cap-widget";
import { useRef, useState } from "react";
import { RenderCaptcha, type CaptchaComponentMode } from "./render-captcha";

export function CapWidgetTest({ mode }: { mode: CaptchaComponentMode }) {
	const capWidgetRef = useRef<CapWidgetHandle>(null);
	const [options, setOptions] = useState<RenderParameters>(() => {
		return {};
	});
	const [response, setResponse] = useState<string | null>(null);
	const [solved, setSolved] = useState<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = capWidgetRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<RenderCaptcha mode={mode} provider="cap-widget" component={CapWidget} 
				ref={capWidgetRef} 
				options={options} 
				endpoint="https://captcha.gurl.eu.org/api/" 
				onSolve={handleSolve}
			/>
			{solved && <p id="captcha-solved">Captcha Solved!</p>}
			<button type="button" onClick={() => capWidgetRef.current?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => capWidgetRef.current?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => capWidgetRef.current?.execute()}>
				Execute
			</button>
			<button type="button" onClick={() => capWidgetRef.current?.render()}>
				Render
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			{response && <p id="captcha-response">{response}</p>}
		</div>
	);
}
