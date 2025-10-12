"use client";
import { useState } from "react";
import { PrivateCaptcha, type RenderParameters } from "react-captcha/provider/private-captcha";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

export function PrivateCaptchaPlayground() {
	const [options, setOptions] = useState<Omit<RenderParameters, "sitekey">>({
		theme: "dark",
		lang: "en",
	});
	return (
		<div className="space-y-2">
			<form>
				<PrivateCaptcha sitekey="aaaaaaaabbbbccccddddeeeeeeeeeeee" options={options} />
			</form>
			<div className="flex gap-2">
				<Select
					value={options.lang}
					onValueChange={(value) => setOptions({ ...options, lang: value as RenderParameters["lang"] })}
				>
					<SelectTrigger className="capitalize">{options.lang}</SelectTrigger>
					<SelectContent>
						{["en", "es", "fr", "de"].map((lang) => (
							<SelectItem key={lang} value={lang}>
								{lang}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={options.theme}
					onValueChange={(value) =>
						setOptions({
							...options,
							theme: value as RenderParameters["theme"],
						})
					}
				>
					<SelectTrigger className="capitalize">{options.theme}</SelectTrigger>
					<SelectContent>
						{["light", "dark"].map((theme) => (
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
