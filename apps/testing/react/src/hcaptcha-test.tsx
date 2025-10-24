import { HCaptcha, type HCaptchaHandle, type RenderParameters } from "@better-captcha/react/provider/hcaptcha";
import { useRef, useState } from "react";

export function HCaptchaTest() {
	const turnstileRef = useRef<HCaptchaHandle>(null);
	const [options, setOptions] = useState(
		(): Omit<RenderParameters, "sitekey"> => ({
			theme: "light",
			size: "normal",
		}),
	);
	const [response, setResponse] = useState<string | null>(null);

	const handleGetResponse = () => {
		const captchaResponse = turnstileRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	return (
		<div>
			<HCaptcha ref={turnstileRef} sitekey="10000000-ffff-ffff-ffff-000000000001" options={options} />
			<button type="button" onClick={() => turnstileRef.current?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => turnstileRef.current?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => turnstileRef.current?.execute()}>
				Execute
			</button>
			<button type="button" onClick={() => turnstileRef.current?.render()}>
				Render
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			<button
				type="button"
				onClick={() => {
					const themes = ["light", "dark", "auto"];
					const currentIndex = themes.indexOf(options.theme ?? "light");
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
