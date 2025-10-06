"use client";

import { createCaptchaComponent } from "../../base-captcha";
import { ReCaptchaProvider } from "./provider";
import type { RenderParameters } from "./types";

export const ReCaptcha =
	createCaptchaComponent<Omit<RenderParameters, "sitekey">>(ReCaptchaProvider);
