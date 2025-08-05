"use client";

import { createCaptchaComponent } from "@react-captcha/core/src/base-captcha";
import { TurnstileProvider } from "./index";
import type { RenderParameters } from "./types";

export const Turnstile =
	createCaptchaComponent<Omit<RenderParameters, "sitekey">>(TurnstileProvider);
