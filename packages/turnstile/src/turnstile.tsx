"use client";

import { createCaptchaComponent } from "@react-captcha/core/src/base-captcha";
import { TurnstileProvider } from "./index";
import type { Turnstile as TurnstileType } from "./types";

export const Turnstile =
	createCaptchaComponent<Omit<TurnstileType.RenderParameters, "sitekey">>(
		TurnstileProvider,
	);
