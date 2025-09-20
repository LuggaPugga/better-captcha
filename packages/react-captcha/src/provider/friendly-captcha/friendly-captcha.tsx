"use client";

import { createCaptchaComponent } from "@/base-captcha";
import { FriendlyCaptchaProvider } from "./index";
import type { RenderParameters } from "./types";

export const FriendlyCaptcha = createCaptchaComponent<
	Omit<RenderParameters, "sitekey" | "element">
>(FriendlyCaptchaProvider);
