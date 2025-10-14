import { createCaptchaController } from "@better-captcha/solid";
import { Prosopo, type ProsopoHandle } from "@better-captcha/solid/provider/prosopo";
import { createSignal } from "solid-js";

export function ProsopoTest() {
	const controller = createCaptchaController<ProsopoHandle>();
	const [response, setResponse] = createSignal<string>("");
	const [theme, setTheme] = createSignal<"light" | "dark" | "auto">("light");

	const handleGetResponse = () => {
		const captchaResponse = controller.handle()?.getResponse() || "No response";
		setResponse(captchaResponse);
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
				/>
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
