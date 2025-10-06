"use client";

import { createCaptchaComponent } from "../../base-captcha";
import { TurnstileProvider } from "./provider";
import type { RenderParameters } from "./types";

const createTurnstile =
	createCaptchaComponent<Omit<RenderParameters, "sitekey">>(TurnstileProvider);

export const Turnstile = createTurnstile;
