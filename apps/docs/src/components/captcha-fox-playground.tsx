"use client";
import type { RenderParameters } from "@better-captcha/react/provider/captcha-fox";
import { CaptchaFox } from "@better-captcha/react/provider/captcha-fox";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

export function CaptchaFoxPlayground() {
	const [options, setOptions] = useState<Omit<RenderParameters, "sitekey">>({
		theme: "auto",
		mode: "inline",
	});
	return (
		<div className="space-y-2">
			<CaptchaFox sitekey="sk_11111111000000001111111100000000" options={options} />

			<div className="flex gap-2">
				<Select
					value={options.mode}
					onValueChange={(value) => setOptions({ ...options, mode: value as RenderParameters["mode"] })}
				>
					<SelectTrigger className="capitalize">{options.mode}</SelectTrigger>
					<SelectContent>
						{["inline", "popup", "hidden"].map((mode) => (
							<SelectItem key={mode} value={mode}>
								{mode}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={typeof options.theme === "string" ? options.theme : "auto"}
					onValueChange={(value) =>
						setOptions({
							...options,
							theme: value as "light" | "dark" | "auto",
						})
					}
				>
					<SelectTrigger className="capitalize">
						{typeof options.theme === "string" ? options.theme : "auto"}
					</SelectTrigger>
					<SelectContent>
						{(["light", "dark", "auto"] as const).map((theme) => (
							<SelectItem key={theme} value={theme}>
								{theme}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
