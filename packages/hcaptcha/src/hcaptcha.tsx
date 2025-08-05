"use client";

import { createCaptchaComponent } from "@react-captcha/core/src/base-captcha";
import { HCaptchaProvider } from "./";
import type { RenderParameters } from "./types";

export const HCaptcha =
	createCaptchaComponent<Omit<RenderParameters, "sitekey">>(HCaptchaProvider);
