"use client";

import { createCaptchaComponent } from "../../base-captcha";
import { type ProsopoHandle, ProsopoProvider } from "./provider";
import type { RenderParameters } from "./types";

const createProsopo = createCaptchaComponent<Omit<RenderParameters, "siteKey" | "element">, ProsopoHandle>(
	ProsopoProvider,
);

export const Prosopo = createProsopo;
