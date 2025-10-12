"use client";

import { createCaptchaComponent } from "../../base-captcha";
import { type HCaptchaHandle, HCaptchaProvider } from "./provider";
import type { RenderParameters } from "./types";

const createHCaptcha = createCaptchaComponent<Omit<RenderParameters, "sitekey">, HCaptchaHandle>(HCaptchaProvider);

export const HCaptcha = createHCaptcha;
