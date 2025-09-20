"use client";

import { createCaptchaComponent } from "../../base-captcha";
import { HCaptchaProvider } from "./";
import type { RenderParameters } from "./types";

const createHCaptcha =
	createCaptchaComponent<Omit<RenderParameters, "sitekey">>(HCaptchaProvider);

export const HCaptcha = createHCaptcha;
