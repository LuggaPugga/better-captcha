import { type CallbackFunction, Prosopo, type ProsopoHandle } from "@better-captcha/react/provider/prosopo";
import { useRef, useState } from "react";
import { RenderCaptcha, type CaptchaComponentMode } from "./render-captcha";

export function ProsopoTest({ mode }: { mode: CaptchaComponentMode }) {
	const captchaRef = useRef<ProsopoHandle>(null);
	const [response, setResponse] = useState<string>("");
	const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
	const [solved, setSolved] = useState<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = captchaRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<h2>Prosopo Test</h2>

			<div>
				<RenderCaptcha mode={mode} provider="prosopo" component={Prosopo}
					ref={captchaRef}
					sitekey="no_test_site_key"
					options={{
						theme,
						callback: ((response) => {
							console.log("Prosopo CAPTCHA verified:", response);
							setResponse(response);
						}) satisfies CallbackFunction,
						"error-callback": ((error) => {
							console.error("Prosopo CAPTCHA error:", error);
						}) satisfies CallbackFunction,
					}}
					onSolve={handleSolve}
				/>
				{solved && <p id="captcha-solved">Captcha Solved!</p>}
			</div>

			<div>
				<button type="button" onClick={handleGetResponse}>
					Get Response
				</button>
				<button type="button" onClick={() => captchaRef.current?.reset()}>
					Reset
				</button>
				<button type="button" onClick={() => captchaRef.current?.execute()}>
					Execute
				</button>
				<button type="button" onClick={() => captchaRef.current?.render()}>
					Render
				</button>
				<button
					type="button"
					onClick={() => {
						const themes = ["light", "dark", "auto"];
						const currentIndex = themes.indexOf(theme || "auto");
						const nextIndex = (currentIndex + 1) % themes.length;
						setTheme(themes[nextIndex] as typeof theme);
					}}
				>
					Change Theme
				</button>
				<button type="button" onClick={() => captchaRef.current?.destroy()}>
					Destroy
				</button>
			</div>

			{response && <p id="captcha-response">{response}</p>}
		</div>
	);
}
