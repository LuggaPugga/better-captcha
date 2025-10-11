"use client";
import { useState } from "react";
import type { RenderParameters } from "react-captcha/provider/friendly-captcha";
import { FriendlyCaptcha } from "react-captcha/provider/friendly-captcha";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

export function FriendlyCaptchaPlayground() {
	const [options, setOptions] = useState<
		Omit<RenderParameters, "sitekey" | "element">
	>({
		theme: "auto",
		startMode: "focus",
		language: "en",
	});
	return (
		<div className="space-y-2">
			<FriendlyCaptcha sitekey="" options={options} />

			<div className="flex gap-2">
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
						{["light", "dark", "auto"].map((theme) => (
							<SelectItem key={theme} value={theme}>
								{theme}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={options.startMode}
					onValueChange={(value) =>
						setOptions({
							...options,
							startMode: value as RenderParameters["startMode"],
						})
					}
				>
					<SelectTrigger className="capitalize">
						{options.startMode}
					</SelectTrigger>
					<SelectContent>
						{["focus", "auto", "programmatic"].map((mode) => (
							<SelectItem key={mode} value={mode}>
								{mode}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={options.language}
					onValueChange={(value) =>
						setOptions({
							...options,
							language: value,
						})
					}
				>
					<SelectTrigger className="capitalize">
						{options.language}
					</SelectTrigger>
					<SelectContent>
						{["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"].map(
							(lang) => (
								<SelectItem key={lang} value={lang}>
									{lang}
								</SelectItem>
							),
						)}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
