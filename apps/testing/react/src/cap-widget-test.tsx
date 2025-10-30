import { type RenderParameters, CapWidget, type CapWidgetHandle } from "@better-captcha/react/provider/cap-widget";
import { useRef, useState } from "react";

export function CapWidgetTest() {
	const capWidgetRef = useRef<CapWidgetHandle>(null);
	const [options, setOptions] = useState<RenderParameters>(() => {
		return {};
	});
	const [response, setResponse] = useState<string | null>(null);

	const handleGetResponse = () => {
		const captchaResponse = capWidgetRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	return (
		<div>
			<CapWidget ref={capWidgetRef} options={options} endpoint="https://captcha.gurl.eu.org/api/" />
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
