"use client";

import { createCaptchaComponent } from "../../base-captcha";
import {
	type FriendlyCaptchaHandle,
	FriendlyCaptchaProvider,
} from "./provider";
import type { RenderParameters } from "./types";

const createFriendlyCaptcha = createCaptchaComponent<
	Omit<RenderParameters, "sitekey" | "element">,
	FriendlyCaptchaHandle
>(FriendlyCaptchaProvider);

export const FriendlyCaptcha = createFriendlyCaptcha;
