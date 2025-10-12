"use client";

import { createCaptchaComponent } from "../../base-captcha";
import { type PrivateCaptchaHandle, PrivateCaptchaProvider } from "./provider";
import type { RenderParameters } from "./types";

const createPrivateCaptcha = createCaptchaComponent<Omit<RenderParameters, "sitekey">, PrivateCaptchaHandle>(
	PrivateCaptchaProvider,
);

export const PrivateCaptcha = createPrivateCaptcha;
