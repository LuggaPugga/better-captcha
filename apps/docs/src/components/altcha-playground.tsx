"use client";
import type { RenderParameters } from "@better-captcha/react/provider/altcha";
import { Altcha } from "@better-captcha/react/provider/altcha";
import { useState } from "react";

export function AltchaPlayground() {
	const [options, setOptions] = useState<RenderParameters>(() => {
		return {};
	});
	return (
		<div className="space-y-2">
			<Altcha endpoint="https://eu.altcha.org/api/v1/challenge?apiKey=ckey_c82e4cb6f2f34eb0a99fb3fbc4c9" options={options} />
		</div>
	);
}
