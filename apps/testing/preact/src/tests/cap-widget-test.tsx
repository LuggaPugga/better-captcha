import { CapWidget, type CapWidgetHandle, type RenderParameters } from "@better-captcha/preact/provider/cap-widget";
import { useRef, useState } from "preact/hooks";

export function CapWidgetTest() {
	const capWidgetRef = useRef<CapWidgetHandle>(null);
	const [options] = useState<RenderParameters>(() => {
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
			<CapWidget
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
