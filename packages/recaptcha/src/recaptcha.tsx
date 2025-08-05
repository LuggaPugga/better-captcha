"use client";

import { createCaptchaComponent } from "@react-captcha/core/src/base-captcha";
import { ReCaptchaProvider } from "./index";
import type { RenderParameters } from "./types";

export const ReCaptcha =
	createCaptchaComponent<Omit<RenderParameters, "sitekey">>(ReCaptchaProvider);
