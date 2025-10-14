import { type RenderParameters, Turnstile, type TurnstileHandle } from "@better-captcha/react/provider/turnstile";
import { useRef, useState } from "react";

export function TurnstileTest() {
	const turnstileRef = useRef<TurnstileHandle>(null);
	const [options, setOptions] = useState((): Omit<RenderParameters, "sitekey"> => {
		return {
			theme: "light",
			size: "normal",
		};
	});
	const [response, setResponse] = useState<string | null>(null);

	const handleGetResponse = () => {
		const captchaResponse = turnstileRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	return (
		<div>
			<Turnstile ref={turnstileRef} options={options} sitekey="1x00000000000000000000AA" />
			<button type="button" onClick={() => turnstileRef.current?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => turnstileRef.current?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => turnstileRef.current?.execute()}>
				Execute
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			<button
				type="button"
				onClick={() => {
					const themes = ["light", "dark", "auto"];
					const currentIndex = themes.indexOf(options.theme || "auto");
					const nextIndex = (currentIndex + 1) % themes.length;
					setOptions({ ...options, theme: themes[nextIndex] as RenderParameters["theme"] });
				}}
			>
				Change Theme
			</button>
			{response && <p id="captcha-response">{response}</p>}
		</div>
	);
}
