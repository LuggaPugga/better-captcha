import { createCaptchaController } from "@better-captcha/solidjs";
import { Prosopo, type ProsopoHandle } from "@better-captcha/solidjs/provider/prosopo";
import { createSignal } from "solid-js";

export function ProsopoTest() {
	const controller = createCaptchaController<ProsopoHandle>();
	const [response, setResponse] = createSignal<string>("");
	const [theme, setTheme] = createSignal<"light" | "dark" | "auto">("light");
	const [solved, setSolved] = createSignal<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() || "No response";
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
				<Prosopo
					controller={controller}
					sitekey="no_test_site_key"
					options={{
						theme: theme(),
						callback: (response) => {
							console.log("Prosopo CAPTCHA verified:", response);
							setResponse(response);
						},
						"error-callback": (error) => {
							console.error("Prosopo CAPTCHA error:", error);
						},
					}}
					onSolve={handleSolve}
				/>
				{solved() && <p id="captcha-solved">Captcha Solved!</p>}
			</div>

			<div>
				<button type="button" onClick={handleGetResponse}>
					Get Response
				</button>
				<button type="button" onClick={() => controller.handle()?.reset()}>
					Reset
				</button>
				<button type="button" onClick={() => controller.handle()?.execute()}>
					Execute
				</button>
				<button
					type="button"
					onClick={() => {
						const themes = ["light", "dark", "auto"];
						const currentIndex = themes.indexOf(theme() || "auto");
						const nextIndex = (currentIndex + 1) % themes.length;
						setTheme(themes[nextIndex] as "light" | "dark" | "auto");
					}}
				>
					Change Theme
				</button>
				<button type="button" onClick={() => controller.handle()?.destroy()}>
					Destroy
				</button>
			</div>

			{response() && <p id="captcha-response">{response()}</p>}
		</div>
	);
}
