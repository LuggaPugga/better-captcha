import { CaptchaFox, type CaptchaFoxHandle, type RenderParameters } from "@better-captcha/react/provider/captcha-fox";
import { useRef, useState } from "react";

export function CaptchaFoxTest() {
	const captchaFoxRef = useRef<CaptchaFoxHandle>(null);
	const [options, setOptions] = useState(
		(): Omit<RenderParameters, "sitekey"> => ({
			theme: "light",
			mode: "inline",
		}),
	);
	const [response, setResponse] = useState<string | null>(null);

	const handleGetResponse = () => {
		const captchaResponse = captchaFoxRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	return (
		<div>
			<CaptchaFox ref={captchaFoxRef} sitekey="sk_11111111000000001111111100000000" options={options} />
			<button type="button" onClick={() => captchaFoxRef.current?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => captchaFoxRef.current?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => captchaFoxRef.current?.execute()}>
				Execute
			</button>
			<button type="button" onClick={() => captchaFoxRef.current?.render()}>
				Render
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			<button
				type="button"
				onClick={() => {
					const themes = ["light", "dark", "auto"];
					const currentIndex = themes.indexOf(options.theme as string);
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
