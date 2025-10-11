"use client";
import { Turnstile } from "react-captcha/provider/turnstile";
import { useState } from "react";
import type { RenderParameters } from "react-captcha/provider/turnstile";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

export function TurnstilePlayground() {
	const [options, setOptions] = useState<Omit<RenderParameters, "sitekey">>({
		theme: "auto",
		size: "normal",
	});
	return (
		<div className="space-y-2">
			<Turnstile sitekey="1x00000000000000000000AA" options={options} />

			<div className="flex gap-2">
				<Select
					value={options.size}
					onValueChange={(value) =>
						setOptions({ ...options, size: value as RenderParameters["size"] })
					}
				>
					<SelectTrigger className="capitalize">{options.size}</SelectTrigger>
					<SelectContent>
						{["normal", "compact", "invisible"].map((size) => (
							<SelectItem className="capitalize" key={size} value={size}>
								{size}
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
						{["light", "dark", "auto"].map((theme) => (
							<SelectItem className="capitalize" key={theme} value={theme}>
								{theme}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
