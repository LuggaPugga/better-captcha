import { useRef, useState } from "react";
import { PrivateCaptcha, type PrivateCaptchaHandle } from "react-captcha/provider/private-captcha";

export function PrivateCaptchaTest() {
	const turnstileRef = useRef<PrivateCaptchaHandle>(null);
	const [options, setOptions] = useState(() => ({
		theme: "light" as const,
		startMode: "auto" as const,
	}));
	const [response, setResponse] = useState<string | null>(null);

	const handleGetResponse = () => {
		const captchaResponse = turnstileRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	return (
		<div>
			<form>
				<PrivateCaptcha ref={turnstileRef} sitekey="aaaaaaaabbbbccccddddeeeeeeeeeeee" options={options} />
			</form>
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
					setOptions({ ...options, theme: themes[nextIndex] as typeof options.theme });
				}}
			>
				Change Theme
			</button>
			{response && <p id="captcha-response">{response}</p>}
		</div>
	);
}
