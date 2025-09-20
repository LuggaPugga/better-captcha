"use client";

import { createCaptchaComponent } from "@/base-captcha";
import { HCaptchaProvider } from "./";
import type { RenderParameters } from "./types";

export const HCaptcha =
	createCaptchaComponent<Omit<RenderParameters, "sitekey">>(HCaptchaProvider);
