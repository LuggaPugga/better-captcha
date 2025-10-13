"use client";

import { createCaptchaComponent } from "../../base-captcha";
import { type CaptchaFoxHandle, CaptchaFoxProvider } from "./provider";
import type { RenderParameters } from "./types";

const createCaptchaFox = createCaptchaComponent<Omit<RenderParameters, "sitekey" | "element">, CaptchaFoxHandle>(
	CaptchaFoxProvider,
);

export const CaptchaFox = createCaptchaFox;
