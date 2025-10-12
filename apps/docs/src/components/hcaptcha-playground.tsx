"use client";
import { useState } from "react";
import type { RenderParameters } from "react-captcha/provider/hcaptcha";
import { HCaptcha } from "react-captcha/provider/hcaptcha";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";

export function HCaptchaPlayground() {
	const [options, setOptions] = useState<Omit<RenderParameters, "sitekey">>({
		theme: "light",
		size: "normal",
	});
	return (
		<div className="space-y-2">
			<HCaptcha sitekey="10000000-ffff-ffff-ffff-000000000001" options={options} />

			<div className="flex gap-2">
				<Select
					value={options.size}
					onValueChange={(value) => setOptions({ ...options, size: value as RenderParameters["size"] })}
				>
					<SelectTrigger className="capitalize">{options.size}</SelectTrigger>
					<SelectContent>
						{["normal", "compact"].map((size) => (
							<SelectItem key={size} value={size}>
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
