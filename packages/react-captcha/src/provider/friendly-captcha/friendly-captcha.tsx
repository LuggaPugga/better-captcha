"use client";

import { createCaptchaComponent } from "../../base-captcha";
import { FriendlyCaptchaProvider } from "./index";
import type { RenderParameters } from "./types";

const createFriendlyCaptcha = createCaptchaComponent<
	Omit<RenderParameters, "sitekey" | "element">
>(FriendlyCaptchaProvider);

export const FriendlyCaptcha = createFriendlyCaptcha;
