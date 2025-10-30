"use client";
import type { RenderParameters } from "@better-captcha/react/provider/cap-widget";
import { CapWidget } from "@better-captcha/react/provider/cap-widget";
import { useState } from "react";

export function CapWidgetPlayground() {
	const [options, setOptions] = useState<RenderParameters>(() => {
		return {};
	});
	return (
		<div className="space-y-2">
			<CapWidget endpoint="https://captcha.gurl.eu.org/api/" options={options} />
		</div>
	);
}

