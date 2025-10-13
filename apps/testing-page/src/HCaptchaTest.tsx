import { useRef, useState } from "react";
import { HCaptcha, type HCaptchaHandle } from "react-captcha/provider/hcaptcha";

export function HCaptchaTest() {
	const turnstileRef = useRef<HCaptchaHandle>(null);
	const [options, setOptions] = useState(() => ({
		theme: "light" as const,
		size: "normal" as const,
	}));
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
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			<button
				type="button"
				onClick={() => {
					const themes = ["light", "dark", "auto"];
					const currentIndex = themes.indexOf(options.theme);
					const nextIndex = (currentIndex + 1) % themes.length;
					setOptions({ ...options, theme: themes[nextIndex] as typeof options.theme });
				}}
			>
				Change Theme
			</button>
			{response && <p id="captcha-response">{response}</p>}
		</div>
	);
}
