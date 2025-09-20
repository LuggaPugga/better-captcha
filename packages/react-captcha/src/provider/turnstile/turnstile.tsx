"use client";

import { createCaptchaComponent } from "@/base-captcha";
import { TurnstileProvider } from "./index";
import type { RenderParameters } from "./types";

export const Turnstile =
	createCaptchaComponent<Omit<RenderParameters, "sitekey">>(TurnstileProvider);
