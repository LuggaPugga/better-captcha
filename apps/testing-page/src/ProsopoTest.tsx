import { useRef, useState } from "react";
import { Prosopo, type ProsopoHandle } from "react-captcha/provider/prosopo";

export function ProsopoTest() {
	const captchaRef = useRef<ProsopoHandle>(null);
	const [response, setResponse] = useState<string>("");
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [captchaType, setCaptchaType] = useState<"frictionless" | "pow" | "image">("frictionless");

	const handleGetResponse = () => {
		const captchaResponse = captchaRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	const handleReset = () => {
		captchaRef.current?.reset();
		setResponse("");
	};

	const handleExecute = async () => {
		await captchaRef.current?.execute();
	};

	const handleChangeTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	const handleDestroy = () => {
		captchaRef.current?.destroy();
		setResponse("");
	};

	return (
		<div style={{ padding: "20px", border: "1px solid #ccc", margin: "10px" }}>
			<h2>Prosopo Test</h2>

			<div style={{ marginBottom: "20px" }}>
				<Prosopo
					ref={captchaRef}
					sitekey="no_test_site_key"
					options={{
						theme,
						captchaType,
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

			<div style={{ marginBottom: "20px" }}>
				<button type="button" onClick={handleGetResponse} style={{ margin: "5px", padding: "10px" }}>
					Get Response
				</button>
				<button type="button" onClick={handleReset} style={{ margin: "5px", padding: "10px" }}>
					Reset
				</button>
				<button type="button" onClick={handleExecute} style={{ margin: "5px", padding: "10px" }}>
					Execute
				</button>
				<button type="button" onClick={handleChangeTheme} style={{ margin: "5px", padding: "10px" }}>
					Change Theme
				</button>
				<button type="button" onClick={handleDestroy} style={{ margin: "5px", padding: "10px" }}>
					Destroy
				</button>
			</div>

			{response && <p id="captcha-response">{response}</p>}
		</div>
	);
}
