import { ReCaptcha, type ReCaptchaHandle, type RenderParameters } from "@better-captcha/react/provider/recaptcha";
import { useRef, useState } from "react";

export function RecaptchaTest() {
	const recaptchaRef = useRef<ReCaptchaHandle>(null);
	const [options, setOptions] = useState(
		(): Omit<RenderParameters, "sitekey"> => ({
			theme: "light",
			size: "normal",
		}),
	);
	const [response, setResponse] = useState<string | null>(null);
	const [solved, setSolved] = useState<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = recaptchaRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<ReCaptcha ref={recaptchaRef} sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" options={options} onSolve={handleSolve} />
			{solved && <p id="captcha-solved">Captcha Solved!</p>}
			<button type="button" onClick={() => recaptchaRef.current?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => recaptchaRef.current?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => recaptchaRef.current?.execute()}>
				Execute
			</button>
			<button type="button" onClick={() => recaptchaRef.current?.render()}>
				Render
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
