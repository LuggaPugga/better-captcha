import {
	ReCaptchaV3,
	type ReCaptchaV3Handle,
	type RenderParameters,
} from "@better-captcha/preact/provider/recaptcha-v3";
import { useRef, useState } from "preact/hooks";

export function RecaptchaV3Test() {
	const recaptchaRef = useRef<ReCaptchaV3Handle>(null);
	const [options, setOptions] = useState<RenderParameters>({
		action: "submit",
	});
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
			<ReCaptchaV3
				ref={recaptchaRef}
				sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
				options={options}
				onSolve={handleSolve}
			/>
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
					const actions = ["submit", "login", "register"];
					const currentIndex = actions.indexOf(options.action);
					const nextIndex = (currentIndex + 1) % actions.length;
					setOptions({ action: actions[nextIndex] });
				}}
			>
				Change Action
			</button>
			{response && <p id="captcha-response">{response}</p>}
		</div>
	);
}
