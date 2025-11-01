import {
	FriendlyCaptcha,
	type FriendlyCaptchaHandle,
	type RenderParameters,
} from "@better-captcha/react/provider/friendly-captcha";
import { useRef, useState } from "react";

export function FriendlyCaptchaTest() {
	const turnstileRef = useRef<FriendlyCaptchaHandle>(null);
	const [options, setOptions] = useState(
		(): Omit<RenderParameters, "sitekey" | "element"> => ({
			theme: "light",
			startMode: "focus",
		}),
	);
	const [response, setResponse] = useState<string | null>(null);
	const [solved, setSolved] = useState<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = turnstileRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<FriendlyCaptcha ref={turnstileRef} sitekey="FC-00000000-0000-0000-0000-000000000000" options={options} onSolve={handleSolve} />
			{solved && <p id="captcha-solved">Captcha Solved!</p>}
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
