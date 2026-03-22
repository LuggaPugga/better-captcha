import { TSec, type TSecHandle } from "@better-captcha/preact/provider/t-sec";
import { useRef, useState } from "preact/hooks";

export function TSecTest() {
	const tsecRef = useRef<TSecHandle>(null);
	const [response, setResponse] = useState<ReturnType<TSecHandle["getResponse"]>>(null);
	const [solved, setSolved] = useState<boolean>(false);

	const handleGetResponse = () => {
		const captchaResponse = tsecRef.current?.getResponse() ?? null;
		setResponse(captchaResponse);
	};

	const handleSolve = (token: string) => {
		setSolved(true);
		console.log("Captcha solved with token:", token);
	};

	return (
		<div>
			<TSec ref={tsecRef} sitekey="189905409" onSolve={handleSolve} options={{ userLanguage: "en" }} />
			{solved && <p id="captcha-solved">Captcha Solved!</p>}
			<button type="button" onClick={() => tsecRef.current?.destroy()}>
				Destroy
			</button>
			<button type="button" onClick={() => tsecRef.current?.reset()}>
				Reset
			</button>
			<button type="button" onClick={() => tsecRef.current?.execute()}>
				Execute
			</button>
			<button type="button" onClick={() => tsecRef.current?.render()}>
				Render
			</button>
			<button type="button" onClick={handleGetResponse}>
				Get Response
			</button>
			{response && <p id="captcha-response">{JSON.stringify(response, null, "\t")}</p>}
		</div>
	);
}
