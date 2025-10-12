"use client";

import { createCaptchaComponent } from "../../base-captcha";
import { type TurnstileHandle, TurnstileProvider } from "./provider";
import type { RenderParameters } from "./types";

const createTurnstile = createCaptchaComponent<Omit<RenderParameters, "sitekey">, TurnstileHandle>(TurnstileProvider);

export const Turnstile = createTurnstile;
