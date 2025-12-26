import { type RenderParameters, Altcha, type AltchaHandle } from "@better-captcha/react/provider/altcha";
import { useRef, useState } from "react";

export function AltchaTest() {
	const altchaRef = useRef<AltchaHandle>(null);
	const [options, setOptions] = useState<RenderParameters>(() => {
		return {};
	});
	const [response, setResponse] = useState<string | null>(null);
	const [solved, setSolved] = useState<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = altchaRef.current?.getResponse() || "No response";
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<Altcha
				ref={altchaRef}
				options={options}
				endpoint="https://eu.altcha.org/api/v1/challenge?apiKey=ckey_c82e4cb6f2f34eb0a99fb3fbc4c9"
				onSolve={handleSolve}
			/>
			{solved && <p id="captcha-solved">Captcha Solved!</p>}
			<button type="button" onClick={() => altchaRef.current?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => altchaRef.current?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => altchaRef.current?.execute()}>
				Execute
			</button>
			<button type="button" onClick={() => altchaRef.current?.render()}>
				Render
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			{response && <p id="captcha-response">{response}</p>}
		</div>
	);
}
