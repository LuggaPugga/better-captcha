import { Geetest, type GeetestHandle } from "@better-captcha/react/provider/geetest";
import { useRef, useState } from "react";

export function GeetestTest() {
	const geetestRef = useRef<GeetestHandle>(null);
	const [response, setResponse] = useState<string | null>(null);
	const [solved, setSolved] = useState<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = geetestRef.current?.getResponse() || "No response";
    if (captchaResponse) {
		  setResponse(JSON.stringify(captchaResponse, null, '\t'));
    }
	};

	const handleSolve = (token: ReturnType<GeetestHandle["getResponse"]>) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<Geetest
				ref={geetestRef} 
        sitekey="08649cc61c7078689263ebf78225d616"
        // onSolve={handleSolve}
        options={{ language: 'eng'}}
			/>
			{solved && <p id="captcha-solved">Captcha Solved!</p>}
			<button type="button" onClick={() => geetestRef.current?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => geetestRef.current?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => geetestRef.current?.execute()}>
				Execute
			</button>
			<button type="button" onClick={() => geetestRef.current?.render()}>
				Render
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			{response && <p id="captcha-response">{response}</p>}
		</div>
	);
}
