"use client";
import type { RenderParameters } from "@better-captcha/react/provider/recaptcha-v3";
import { ReCaptchaV3 } from "@better-captcha/react/provider/recaptcha-v3";
import { useState } from "react";

export function ReCaptchaV3Playground() {
	const [options, setOptions] = useState<RenderParameters>({
		action: "submit",
	});
	const [token, setToken] = useState<string | null>(null);

	return (
		<div className="space-y-4">
			<ReCaptchaV3
				sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
				options={options}
				onSolve={(t) => setToken(t)}
				
			/>

			{token && (
				<div className="rounded-md bg-muted p-3">
					<p className="text-sm font-medium">Token received:</p>
					<p className="mt-1 break-all text-xs text-muted-foreground">{token}</p>
				</div>
			)}
		</div>
	);
}

